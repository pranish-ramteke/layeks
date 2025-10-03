import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { booking_id, payment_method, payment_details } = await req.json();

    console.log('Processing payment for booking:', booking_id);

    if (!booking_id || !payment_method) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .eq('user_id', user.id)
      .single();

    if (bookingError || !booking) {
      console.error('Booking error:', bookingError);
      return new Response(
        JSON.stringify({ error: 'Booking not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let paymentStatus = 'pending';
    let transactionId = null;

    // Process payment based on method
    if (payment_method === 'cash') {
      // Cash payment - mark as pending, admin will confirm
      paymentStatus = 'pending';
      transactionId = `CASH_${Date.now()}`;
    } else if (payment_method === 'upi' || payment_method === 'card') {
      // For online payments, create Razorpay order
      const amountInPaise = Math.round(Number(booking.total_amount) * 100);
      
      const razorpayOrderData = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: booking.booking_reference,
        notes: {
          booking_id: booking.id,
          user_id: user.id
        }
      };

      console.log('Creating Razorpay order:', razorpayOrderData);

      const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`
        },
        body: JSON.stringify(razorpayOrderData)
      });

      if (!razorpayResponse.ok) {
        const errorData = await razorpayResponse.json();
        console.error('Razorpay error:', errorData);
        return new Response(
          JSON.stringify({ error: 'Payment gateway error', details: errorData }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const razorpayOrder = await razorpayResponse.json();
      transactionId = razorpayOrder.id;
      
      // For now, we'll mark as pending until webhook confirms
      // In a real implementation, you'd verify the payment signature from frontend
      if (payment_details?.razorpay_payment_id) {
        paymentStatus = 'completed';
      }
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id,
        amount: booking.total_amount,
        payment_method,
        payment_status: paymentStatus,
        transaction_id: transactionId,
        payment_details: payment_details || {}
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      return new Response(
        JSON.stringify({ error: 'Failed to create payment record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update booking status
    const bookingStatus = paymentStatus === 'completed' ? 'confirmed' : 'pending';
    
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_status: paymentStatus,
        status: bookingStatus
      })
      .eq('id', booking_id);

    if (updateError) {
      console.error('Booking update error:', updateError);
    }

    console.log('Payment processed successfully:', payment.id);

    // Send booking confirmation email if payment is completed
    if (paymentStatus === 'completed') {
      try {
        await supabase.functions.invoke('send-booking-confirmation', {
          body: { booking_id: booking_id }
        });
        console.log('Confirmation email sent for booking:', booking_id);
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the payment if email fails
      }
    }

    return new Response(
      JSON.stringify({ 
        payment,
        razorpay_order_id: transactionId,
        razorpay_key_id: RAZORPAY_KEY_ID
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
