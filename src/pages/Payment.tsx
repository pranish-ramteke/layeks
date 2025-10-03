import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CreditCard, Smartphone, Banknote, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { getSafeErrorMessage, validateLuhn } from "@/lib/errorUtils";

// Validation schemas for payment inputs
const upiSchema = z.object({
  upiId: z.string()
    .min(3, "UPI ID must be at least 3 characters")
    .max(100, "UPI ID is too long")
    .regex(/^[\w.\-]+@[\w]+$/, "Invalid UPI ID format (e.g., user@bank)"),
});

const cardSchema = z.object({
  cardNumber: z.string()
    .regex(/^\d{13,19}$/, "Card number must be 13-19 digits")
    .refine(validateLuhn, "Invalid card number"),
  cardExpiry: z.string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry must be in MM/YY format")
    .refine((val) => {
      const [month, year] = val.split('/').map(Number);
      const expiry = new Date(2000 + year, month - 1);
      return expiry > new Date();
    }, "Card has expired"),
  cvv: z.string()
    .regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
});

export default function Payment() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("UPI");
  
  // Payment form states
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

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

  const handlePayment = async () => {
    // Validate inputs based on payment method
    try {
      if (paymentMethod === "UPI") {
        const result = upiSchema.safeParse({ upiId: upiId.trim() });
        if (!result.success) {
          toast({
            title: "Validation Error",
            description: result.error.errors[0].message,
            variant: "destructive",
          });
          return;
        }
      } else if (paymentMethod === "Credit" || paymentMethod === "Debit") {
        const result = cardSchema.safeParse({
          cardNumber: cardNumber.replace(/\s/g, ''),
          cardExpiry: cardExpiry.trim(),
          cvv: cardCvv.trim(),
        });
        if (!result.success) {
          toast({
            title: "Validation Error",
            description: result.error.errors[0].message,
            variant: "destructive",
          });
          return;
        }
      }
    } catch (validationError) {
      toast({
        title: "Validation Error",
        description: "Please check your payment details and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);

      // Create payment record
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      // Sanitize and limit data stored in payment_details
      const paymentDetails = paymentMethod === "UPI"
        ? { upiId: upiId.trim().slice(0, 100) }
        : {
            cardLast4: cardNumber.replace(/\s/g, '').slice(-4),
            cardType: paymentMethod === "Credit" ? "Credit Card" : "Debit Card",
          };
      
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          booking_id: bookingId!,
          amount: booking.total_amount,
          payment_method: paymentMethod,
          payment_status: paymentMethod === "Cash" ? "pending" : "success",
          transaction_id: transactionId,
          payment_details: paymentDetails,
        });

      if (paymentError) throw paymentError;

      // Update booking status
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({
          payment_status: paymentMethod === "Cash" ? "pending" : "paid",
          status: paymentMethod === "Cash" ? "pending" : "confirmed",
        })
        .eq("id", bookingId!);

      if (bookingError) throw bookingError;

      toast({
        title: "Payment successful!",
        description: "Your booking has been confirmed",
      });

      navigate(`/booking/${bookingId}/confirmation`);
    } catch (error: any) {
      toast({
        title: "Payment failed",
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
          <h1 className="font-serif text-4xl font-bold mb-2">Payment</h1>
          <p className="text-muted-foreground">Complete your booking by making a payment</p>
        </div>

        {/* Amount Summary */}
        <Card className="mb-6 border-primary">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <span className="text-lg">Total Amount</span>
              <span className="text-3xl font-bold text-primary">
                ₹{booking.total_amount.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value="UPI" id="upi" />
                  <Label htmlFor="upi" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <span className="font-semibold">UPI</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value="Credit" id="credit" />
                  <Label htmlFor="credit" className="flex items-center gap-3 cursor-pointer flex-1">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Credit Card</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value="Debit" id="debit" />
                  <Label htmlFor="debit" className="flex items-center gap-3 cursor-pointer flex-1">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Debit Card</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value="Cash" id="cash" />
                  <Label htmlFor="cash" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Banknote className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Pay at Hotel (Cash)</span>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Payment Details Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentMethod === "UPI" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="upiId">UPI ID</Label>
                  <Input
                    id="upiId"
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    maxLength={100}
                  />
                </div>
              </div>
            )}

            {(paymentMethod === "Credit" || paymentMethod === "Debit") && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim())}
                    maxLength={19}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cardExpiry">Expiry Date</Label>
                    <Input
                      id="cardExpiry"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, "");
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + "/" + value.slice(2, 4);
                        }
                        setCardExpiry(value);
                      }}
                      maxLength={5}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cardCvv">CVV</Label>
                    <Input
                      id="cardCvv"
                      type="password"
                      placeholder="123"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "Cash" && (
              <div className="p-4 bg-accent/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  You can pay in cash at the hotel during check-in. Your booking will be confirmed once you complete this step.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          onClick={handlePayment}
          size="lg"
          className="w-full"
          disabled={processing}
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Payment...
            </>
          ) : (
            `Confirm and Pay ₹${booking.total_amount.toLocaleString()}`
          )}
        </Button>
      </main>

      <Footer />
    </div>
  );
}
