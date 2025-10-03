import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckCircle2, Calendar, Users, Hotel, Mail, Phone, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Confirmation() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [booking, setBooking] = useState<any>(null);
  const [hotel, setHotel] = useState<any>(null);
  const [roomType, setRoomType] = useState<any>(null);
  const [guest, setGuest] = useState<any>(null);
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

      const { data: guestData } = await supabase
        .from("booking_guests")
        .select("*")
        .eq("booking_id", bookingId)
        .single();
      setGuest(guestData);

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
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="font-serif text-4xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground">
            Your booking has been successfully confirmed. A confirmation email has been sent to your email address.
          </p>
        </div>

        {/* Booking Reference */}
        <Card className="mb-6 border-primary">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Booking Reference</p>
            <p className="text-3xl font-bold text-primary">{booking.booking_reference}</p>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {/* Hotel & Room Details */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <Hotel className="h-5 w-5 text-primary mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{hotel.name}</h3>
                  {hotel.address && (
                    <p className="text-sm text-muted-foreground">{hotel.address}</p>
                  )}
                  {hotel.phone && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3" />
                      {hotel.phone}
                    </p>
                  )}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <p className="font-semibold mb-1">{roomType.name}</p>
                <p className="text-sm text-muted-foreground">{roomType.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Stay Details */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Check-in</span>
                </div>
                <span className="font-semibold">
                  {format(new Date(booking.check_in_date), "EEEE, MMM dd, yyyy")}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Check-out</span>
                </div>
                <span className="font-semibold">
                  {format(new Date(booking.check_out_date), "EEEE, MMM dd, yyyy")}
                </span>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Guests</span>
                </div>
                <span className="font-semibold">{booking.num_guests}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nights</span>
                <span className="font-semibold">{booking.num_nights}</span>
              </div>
            </CardContent>
          </Card>

          {/* Guest Information */}
          {guest && (
            <Card>
              <CardContent className="p-6 space-y-3">
                <h3 className="font-semibold mb-3">Guest Information</h3>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Name</span>
                  <span className="font-semibold">{guest.full_name}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Email</span>
                  </div>
                  <span className="font-semibold text-sm">{guest.email}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Phone</span>
                  </div>
                  <span className="font-semibold">{guest.phone}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Summary */}
          <Card>
            <CardContent className="p-6 space-y-3">
              <h3 className="font-semibold mb-3">Payment Summary</h3>
              
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
                <span className="font-bold">Total Paid</span>
                <span className="font-bold text-primary">
                  ₹{booking.total_amount.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">Payment Status</span>
                <span className={`text-sm font-semibold ${
                  booking.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {booking.payment_status === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-4">
            <Button variant="outline" size="lg" className="gap-2">
              <Download className="h-4 w-4" />
              Download Invoice
            </Button>
            <Button onClick={() => navigate("/")} size="lg">
              Back to Home
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
