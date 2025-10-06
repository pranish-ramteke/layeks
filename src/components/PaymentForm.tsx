import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, Smartphone, Banknote } from "lucide-react";

interface PaymentFormProps {
  amount: number;
  onSubmit: (paymentMethod: string) => Promise<void>;
  loading?: boolean;
}

const PaymentForm = ({ amount, onSubmit, loading }: PaymentFormProps) => {
  const [paymentMethod, setPaymentMethod] = useState<string>("upi");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(paymentMethod);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
              <RadioGroupItem value="upi" id="upi" />
              <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer flex-1">
                <Smartphone className="h-5 w-5" />
                <div>
                  <div className="font-semibold">UPI</div>
                  <div className="text-sm text-muted-foreground">Pay using any UPI app</div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                <CreditCard className="h-5 w-5" />
                <div>
                  <div className="font-semibold">Credit/Debit Card</div>
                  <div className="text-sm text-muted-foreground">Visa, Mastercard, Rupay, etc.</div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                <Banknote className="h-5 w-5" />
                <div>
                  <div className="font-semibold">Pay at Hotel</div>
                  <div className="text-sm text-muted-foreground">Pay in cash during check-in</div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={loading}
          >
            {loading ? "Processing..." : `Pay ₹${amount.toLocaleString()}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
