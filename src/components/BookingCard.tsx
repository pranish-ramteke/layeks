import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, MapPin, CreditCard, X } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

interface BookingCardProps {
  booking: any;
  onCancel?: () => void;
  isPast?: boolean;
}

const BookingCard = ({ booking, onCancel, isPast = false }: BookingCardProps) => {
  const [cancelling, setCancelling] = useState(false);

  const handleCancelBooking = async () => {
    try {
      setCancelling(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "Please log in to cancel bookings",
          variant: "destructive",
        });
        return;
      }

      const response = await supabase.functions.invoke('cancel-booking', {
        body: {
          booking_id: booking.id,
          reason: 'Customer requested cancellation'
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Booking Cancelled",
        description: response.data.message,
      });

      if (onCancel) onCancel();
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel booking",
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      confirmed: "default",
      pending: "secondary",
      cancelled: "destructive",
      completed: "outline",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
      refunded: "outline",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const canCancel = !isPast && booking.status !== 'cancelled' && booking.status !== 'completed';
  const checkInDate = new Date(booking.check_in_date);
  const hoursUntilCheckIn = (checkInDate.getTime() - new Date().getTime()) / (1000 * 60 * 60);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row">
        {/* Hotel Image */}
        <div className="md:w-1/3 h-48 md:h-auto">
          <img
            src={booking.hotels?.images?.[0] || "/placeholder.svg"}
            alt={booking.hotels?.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Booking Details */}
        <div className="flex-1">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-semibold mb-1">{booking.hotels?.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {booking.hotels?.address}
                </p>
              </div>
              <div className="flex gap-2">
                {getStatusBadge(booking.status)}
                {getPaymentBadge(booking.payment_status)}
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(new Date(booking.check_in_date), 'MMM dd, yyyy')} - {format(new Date(booking.check_out_date), 'MMM dd, yyyy')}
                </span>
                <span className="text-muted-foreground">
                  ({booking.num_nights} {booking.num_nights === 1 ? 'night' : 'nights'})
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{booking.num_guests} {booking.num_guests === 1 ? 'Guest' : 'Guests'}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">₹{Number(booking.total_amount).toFixed(2)}</span>
              </div>
            </div>

            <div className="text-sm bg-muted p-3 rounded">
              <p className="font-medium mb-1">Room: {booking.room_types?.name}</p>
              <p className="text-muted-foreground">Booking Ref: {booking.booking_reference}</p>
            </div>
          </CardContent>

          {canCancel && (
            <CardFooter className="bg-muted/50 p-6 pt-0">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full" disabled={cancelling}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel Booking
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                    <AlertDialogDescription>
                      {hoursUntilCheckIn > 24 ? (
                        <>You will receive a full refund if you cancel more than 24 hours before check-in.</>
                      ) : hoursUntilCheckIn > 0 ? (
                        <>You will receive a 50% refund if you cancel within 24 hours of check-in.</>
                      ) : (
                        <>No refund available for cancellations after check-in time.</>
                      )}
                      <br /><br />
                      Are you sure you want to cancel this booking?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelBooking} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Yes, Cancel
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          )}
        </div>
      </div>
    </Card>
  );
};

export default BookingCard;
