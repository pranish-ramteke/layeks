import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, Users, Hotel, Info, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BookingSummary() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [booking, setBooking] = useState<any>(null);
  const [hotel, setHotel] = useState<any>(null);
  const [roomType, setRoomType] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);

      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (bookingError) throw bookingError;
      setBooking(bookingData);

      const { data: hotelData } = await supabase
        .from("hotels")
        .select("*")
        .eq("id", bookingData.hotel_id)
        .single();
      setHotel(hotelData);

      const { data: roomTypeData } = await supabase
        .from("room_types")
        .select("*")
        .eq("id", bookingData.room_type_id)
        .single();
      setRoomType(roomTypeData);

    } catch (error: any) {
      console.error("Error fetching booking:", error);
      toast({
        title: "Error",
        description: "Failed to load booking details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate(`/booking/${bookingId}/guest-info`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking || !hotel || !roomType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Booking not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 mt-20 max-w-4xl">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold mb-2">Booking Summary</h1>
          <p className="text-muted-foreground">Review your booking details before continuing</p>
        </div>

        <div className="grid gap-6">
          {/* Hotel & Room Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="h-5 w-5" />
                Hotel & Room Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Hotel</p>
                <p className="font-semibold text-lg">{hotel.name}</p>
                {hotel.address && <p className="text-sm text-muted-foreground">{hotel.address}</p>}
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm text-muted-foreground">Room Type</p>
                <p className="font-semibold text-lg">{roomType.name}</p>
                {roomType.description && (
                  <p className="text-sm text-muted-foreground mt-1">{roomType.description}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stay Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Stay Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check-in</span>
                <span className="font-semibold">
                  {format(new Date(booking.check_in_date), "EEEE, MMMM dd, yyyy")}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check-out</span>
                <span className="font-semibold">
                  {format(new Date(booking.check_out_date), "EEEE, MMMM dd, yyyy")}
                </span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Number of Guests
                </span>
                <span className="font-semibold">{booking.num_guests}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Number of Nights</span>
                <span className="font-semibold">{booking.num_nights}</span>
              </div>
            </CardContent>
          </Card>

          {/* Price Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Price Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  ₹{booking.room_rate.toLocaleString()} × {booking.num_nights} nights
                </span>
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
              
              <p className="text-sm text-muted-foreground">
                All prices are inclusive of taxes
              </p>
            </CardContent>
          </Card>

          {/* Cancellation Policy */}
          <Card className="border-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Cancellation Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                <strong>Free cancellation</strong> up to 24 hours before check-in.
              </p>
              <p className="text-sm text-muted-foreground">
                Cancellations made less than 24 hours before check-in are non-refundable.
              </p>
              <p className="text-sm text-muted-foreground">
                No-shows will be charged the full amount.
              </p>
            </CardContent>
          </Card>

          {/* Continue Button */}
          <Button onClick={handleContinue} size="lg" className="w-full">
            Continue to Guest Information
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
