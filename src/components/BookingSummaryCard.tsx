import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Users, Hotel, CreditCard } from "lucide-react";
import { format } from "date-fns";

interface BookingSummaryCardProps {
  hotelName: string;
  roomTypeName: string;
  checkIn: string;
  checkOut: string;
  numNights: number;
  numGuests: number;
  roomRate: number;
  taxes: number;
  totalAmount: number;
}

const BookingSummaryCard = ({
  hotelName,
  roomTypeName,
  checkIn,
  checkOut,
  numNights,
  numGuests,
  roomRate,
  taxes,
  totalAmount
}: BookingSummaryCardProps) => {
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-2xl">Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hotel & Room Info */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Hotel className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">{hotelName}</p>
              <p className="text-sm text-muted-foreground">{roomTypeName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <div className="text-sm">
              <p className="font-medium">{format(new Date(checkIn), 'EEE, MMM dd')} - {format(new Date(checkOut), 'EEE, MMM dd')}</p>
              <p className="text-muted-foreground">{numNights} {numNights === 1 ? 'night' : 'nights'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium">{numGuests} {numGuests === 1 ? 'Guest' : 'Guests'}</p>
          </div>
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-primary" />
            <p className="font-semibold">Price Breakdown</p>
          </div>

          <div className="space-y-2 pl-8">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">₹{roomRate.toFixed(2)} × {numNights} nights</span>
              <span className="font-medium">₹{(roomRate * numNights).toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxes & fees (18%)</span>
              <span className="font-medium">₹{taxes.toFixed(2)}</span>
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-bold pt-2">
              <span>Total</span>
              <span className="text-primary">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Policies */}
        <div className="bg-muted p-4 rounded-lg text-xs space-y-2">
          <p className="font-semibold">Cancellation Policy</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Free cancellation up to 24 hours before check-in</li>
            <li>• 50% refund within 24 hours of check-in</li>
            <li>• No refund after check-in time</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingSummaryCard;
