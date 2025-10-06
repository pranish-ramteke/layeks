import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Verify payment request received");

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Parse request body
    const { booking_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    console.log("Verifying payment:", { booking_id, razorpay_order_id, razorpay_payment_id });

    // Verify signature
    const razorpaySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = createHmac("sha256", razorpaySecret)
      .update(text)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("Signature verification failed");
      throw new Error("Invalid payment signature");
    }

    console.log("Signature verified successfully");

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", booking_id)
      .eq("user_id", user.id)
      .single();

    if (bookingError || !booking) {
      console.error("Booking not found:", bookingError);
      throw new Error("Booking not found");
    }

    // Update payment record
    const { error: paymentUpdateError } = await supabase
      .from("payments")
      .update({
        payment_status: "completed",
        transaction_id: razorpay_payment_id,
      })
      .eq("booking_id", booking_id);

    if (paymentUpdateError) {
      console.error("Failed to update payment:", paymentUpdateError);
      throw paymentUpdateError;
    }

    // Update booking status
    const { error: bookingUpdateError } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        payment_status: "completed",
      })
      .eq("id", booking_id);

    if (bookingUpdateError) {
      console.error("Failed to update booking:", bookingUpdateError);
      throw bookingUpdateError;
    }

    console.log("Payment verified and booking confirmed");

    // Send confirmation email
    try {
      await supabase.functions.invoke("send-booking-confirmation", {
        body: { booking_id },
      });
      console.log("Confirmation email sent");
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't fail the payment verification if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in verify-payment function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
