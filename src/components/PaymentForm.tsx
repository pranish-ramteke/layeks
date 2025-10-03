import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Smartphone, Banknote, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";

const upiSchema = z.object({
  upiId: z.string().min(5, "UPI ID must be at least 5 characters").regex(/@/, "UPI ID must contain @"),
});

const cardSchema = z.object({
  cardNumber: z.string().length(16, "Card number must be 16 digits").regex(/^\d+$/, "Card number must contain only digits"),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, "Expiry must be in MM/YY format"),
  cvv: z.string().length(3, "CVV must be 3 digits").regex(/^\d+$/, "CVV must contain only digits"),
  name: z.string().min(3, "Name must be at least 3 characters"),
});

interface PaymentFormProps {
  amount: number;
  onSubmit: (paymentMethod: string, paymentDetails: any) => Promise<void>;
  loading?: boolean;
}

const PaymentForm = ({ amount, onSubmit, loading = false }: PaymentFormProps) => {
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let paymentDetails = {};

      if (paymentMethod === "upi") {
        const result = upiSchema.safeParse({ upiId });
        if (!result.success) {
          toast({
            title: "Invalid UPI ID",
            description: result.error.errors[0].message,
            variant: "destructive",
          });
          return;
        }
        paymentDetails = { upi_id: upiId };
      } else if (paymentMethod === "card") {
        const result = cardSchema.safeParse({
          cardNumber,
          expiry,
          cvv,
          name: cardName,
        });
        if (!result.success) {
          toast({
            title: "Invalid Card Details",
            description: result.error.errors[0].message,
            variant: "destructive",
          });
          return;
        }
        paymentDetails = {
          card_number: `****${cardNumber.slice(-4)}`,
          expiry,
          name: cardName,
        };
      }

      await onSubmit(paymentMethod, paymentDetails);
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "An error occurred during payment",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Choose how you want to pay</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
            <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="upi" id="upi" />
              <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer flex-1">
                <Smartphone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">UPI</p>
                  <p className="text-sm text-muted-foreground">Pay using UPI ID</p>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                <CreditCard className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Credit/Debit Card</p>
                  <p className="text-sm text-muted-foreground">Pay using card</p>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                <Banknote className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Pay at Hotel</p>
                  <p className="text-sm text-muted-foreground">Pay cash at check-in</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Payment Details Forms */}
      {paymentMethod === "upi" && (
        <Card>
          <CardHeader>
            <CardTitle>UPI Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="upiId">UPI ID</Label>
              <Input
                id="upiId"
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>
      )}

      {paymentMethod === "card" && (
        <Card>
          <CardHeader>
            <CardTitle>Card Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
                maxLength={16}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiry (MM/YY)</Label>
                <Input
                  id="expiry"
                  placeholder="12/25"
                  value={expiry}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2, 4);
                    }
                    setExpiry(value);
                  }}
                  maxLength={5}
                  required
                />
              </div>

              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="password"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                  maxLength={3}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                placeholder="John Doe"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>
      )}

      {paymentMethod === "cash" && (
        <Card className="bg-muted">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              You will be able to pay in cash at the hotel during check-in. Your booking will be confirmed once the payment is received.
            </p>
          </CardContent>
        </Card>
      )}

      <Button
        type="submit"
        className="w-full h-12 text-lg"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ₹${amount.toFixed(2)}`
        )}
      </Button>
    </form>
  );
};

export default PaymentForm;
