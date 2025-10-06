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

  const handlePayment = async (paymentMethod: string, paymentDetails: any) => {
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

      // Call process-payment edge function
      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: {
          booking_id: bookingId,
          payment_method: paymentMethod,
          payment_details: paymentDetails,
        },
      });

      if (error) throw error;

      toast({
        title: "Payment Successful",
        description: paymentMethod === "cash" 
          ? "Your booking is confirmed. Please pay at the hotel during check-in."
          : "Your payment has been processed successfully",
      });

      navigate(`/booking/${bookingId}/confirmation`);
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
    } finally {
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
