import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useBooking } from "@/hooks/useBooking";
import { DateRangePicker } from "@/components/DateRangePicker";
import { GuestCounter } from "@/components/GuestCounter";
import { RoomTypeCard } from "@/components/RoomTypeCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, Phone, Mail, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSafeErrorMessage } from "@/lib/errorUtils";

export default function HotelDetails() {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { bookingState, updateBooking, setDateRange } = useBooking();
  
  const [hotel, setHotel] = useState<any>(null);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [showRooms, setShowRooms] = useState(false);
  
  const [dateRange, setDateRangeState] = useState<DateRange | undefined>({
    from: bookingState.checkIn,
    to: bookingState.checkOut,
  });
  const [guests, setGuests] = useState(bookingState.numGuests || 1);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    fetchHotelData();
  }, [hotelId]);

  useEffect(() => {
    const handleScroll = () => {
      // Shrink the booking box after scrolling 100px
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchHotelData = async () => {
    try {
      setLoading(true);
      
      // Fetch hotel details
      const { data: hotelData, error: hotelError } = await supabase
        .from("hotels")
        .select("*")
        .eq("id", hotelId)
        .single();

      if (hotelError) throw hotelError;
      setHotel(hotelData);

      // Fetch room types
      const { data: roomTypesData, error: roomTypesError } = await supabase
        .from("room_types")
        .select("*")
        .eq("hotel_id", hotelId);

      if (roomTypesError) throw roomTypesError;
      setRoomTypes(roomTypesData || []);
      
    } catch (error: any) {
      console.error("Error fetching hotel data:", error);
      toast({
        title: "Error",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDateRange: DateRange | undefined) => {
    setDateRangeState(newDateRange);
    setDateRange(newDateRange);
  };

  const handleCheckAvailability = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: "Select dates",
        description: "Please select check-in and check-out dates",
        variant: "destructive",
      });
      return;
    }

    setCheckingAvailability(true);
    updateBooking({
      hotelId,
      numGuests: guests,
    });
    
    // Simulate checking availability
    setTimeout(() => {
      setCheckingAvailability(false);
      setShowRooms(true);
      toast({
        title: "Rooms available!",
        description: "Here are the available room types for your dates",
      });
    }, 1000);
  };

  const handleReserve = async (roomTypeId: string) => {
    const roomType = roomTypes.find(rt => rt.id === roomTypeId);
    if (!roomType) return;

    updateBooking({
      roomTypeId,
      roomRate: roomType.base_price_per_night,
    });

    // Create a booking record
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Sign in required",
          description: "Please sign in to continue with booking",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const bookingRef = `BK-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          booking_reference: bookingRef,
          user_id: user.id,
          hotel_id: hotelId!,
          room_type_id: roomTypeId,
          check_in_date: format(dateRange!.from, "yyyy-MM-dd"),
          check_out_date: format(dateRange!.to, "yyyy-MM-dd"),
          num_guests: guests,
          num_nights: bookingState.numNights,
          room_rate: roomType.base_price_per_night,
          taxes: bookingState.taxes,
          total_amount: bookingState.totalAmount,
          status: 'pending',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      navigate(`/booking/${booking.id}/summary`);
    } catch (error: any) {
      console.error("Error creating booking:", error);
      toast({
        title: "Error",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Hotel not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        {/* Hotel Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">{hotel.name}</h1>
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            {hotel.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{hotel.address}</span>
              </div>
            )}
            {hotel.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{hotel.phone}</span>
              </div>
            )}
            {hotel.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{hotel.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Hotel Images */}
        {hotel.images && hotel.images.length > 0 && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <img
              src={hotel.images[0]}
              alt={hotel.name}
              className="w-full h-96 object-cover rounded-lg"
            />
            {hotel.images[1] && (
              <div className="grid grid-cols-2 gap-4">
                {hotel.images.slice(1, 5).map((img: string, idx: number) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${hotel.name} ${idx + 2}`}
                    className="w-full h-44 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {hotel.description && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="font-serif text-2xl font-bold mb-4">About This Hotel</h2>
              <p className="text-muted-foreground leading-relaxed">{hotel.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Booking Widget */}
        <Card className={`mb-8 sticky top-24 z-10 shadow-warm transition-all duration-300 ${
          isScrolled ? 'bg-background/95 backdrop-blur' : ''
        }`}>
          <CardContent className={`transition-all duration-300 ${
            isScrolled ? 'p-3' : 'p-6'
          }`}>
            {!isScrolled ? (
              <>
                <h2 className="font-serif text-2xl font-bold mb-6">Book Your Stay</h2>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Check-in & Check-out</label>
                    <DateRangePicker date={dateRange} onDateChange={handleDateChange} />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Number of Guests</label>
                    <GuestCounter guests={guests} onGuestsChange={setGuests} />
                  </div>
                </div>

                <Button
                  onClick={handleCheckAvailability}
                  disabled={checkingAvailability || !dateRange?.from || !dateRange?.to}
                  className="w-full"
                  size="lg"
                >
                  {checkingAvailability ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking Availability...
                    </>
                  ) : (
                    "Check Availability"
                  )}
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground text-xs">Dates:</span>
                  <DateRangePicker date={dateRange} onDateChange={handleDateChange} />
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground text-xs">Guests:</span>
                  <GuestCounter guests={guests} onGuestsChange={setGuests} />
                </div>

                <Button
                  onClick={handleCheckAvailability}
                  disabled={checkingAvailability || !dateRange?.from || !dateRange?.to}
                  size="sm"
                  className="ml-auto"
                >
                  {checkingAvailability ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    "Check"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Rooms */}
        {showRooms && roomTypes.length > 0 && (
          <div>
            <h2 className="font-serif text-3xl font-bold mb-6">Available Rooms</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roomTypes.map((roomType) => (
                <RoomTypeCard
                  key={roomType.id}
                  id={roomType.id}
                  name={roomType.name}
                  description={roomType.description || ""}
                  pricePerNight={roomType.base_price_per_night}
                  maxGuests={roomType.max_guests}
                  amenities={roomType.amenities || []}
                  images={roomType.images || []}
                  onReserve={handleReserve}
                  numNights={bookingState.numNights}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
