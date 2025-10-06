import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PaymentForm from "@/components/PaymentForm";
import { getSafeErrorMessage } from "@/lib/errorUtils";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Payment() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (error) throw error;
      setBooking(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (paymentMethod: string) => {
    try {
      setProcessing(true);

      // Get auth session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to complete payment",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Handle cash payment directly
      if (paymentMethod === "cash") {
        const { error } = await supabase.functions.invoke("process-payment", {
          body: {
            booking_id: bookingId,
            payment_method: "cash",
          },
        });

        if (error) throw error;

        toast({
          title: "Booking Confirmed",
          description: "Please pay in cash during check-in.",
        });

        navigate(`/booking/${bookingId}/confirmation`);
        return;
      }

      // For UPI/Card - Create Razorpay order
      const { data: orderData, error: orderError } = await supabase.functions.invoke("process-payment", {
        body: {
          booking_id: bookingId,
          payment_method: paymentMethod,
        },
      });

      if (orderError) throw orderError;

      // Open Razorpay Checkout
      const options = {
        key: orderData.razorpay_key_id,
        amount: booking.total_amount * 100, // Amount in paise
        currency: "INR",
        name: "Hotel Suvam & Atithi",
        description: `Booking #${booking.booking_reference}`,
        order_id: orderData.razorpay_order_id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const { error: verifyError } = await supabase.functions.invoke("verify-payment", {
              body: {
                booking_id: bookingId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            });

            if (verifyError) throw verifyError;

            toast({
              title: "Payment Successful",
              description: "Your booking has been confirmed!",
            });

            navigate(`/booking/${bookingId}/confirmation`);
          } catch (error: any) {
            console.error("Payment verification error:", error);
            toast({
              title: "Payment Verification Failed",
              description: getSafeErrorMessage(error),
              variant: "destructive",
            });
          }
        },
        prefill: {
          email: session.user.email,
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
            toast({
              title: "Payment Cancelled",
              description: "You can try again when ready.",
              variant: "destructive",
            });
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setProcessing(false);
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Booking not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 mt-20 max-w-2xl">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold mb-2">Complete Payment</h1>
          <p className="text-muted-foreground">Choose your payment method and complete your booking</p>
        </div>

        <div className="space-y-6">
          {/* Total Amount */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Room Rate × {booking.num_nights} nights</span>
                <span className="font-semibold">
                  ₹{(booking.room_rate * booking.num_nights).toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxes (12% GST)</span>
                <span className="font-semibold">₹{booking.taxes.toLocaleString()}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total Amount</span>
                <span className="font-bold text-primary">₹{booking.total_amount.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <PaymentForm
            amount={booking.total_amount}
            onSubmit={handlePayment}
            loading={processing}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
