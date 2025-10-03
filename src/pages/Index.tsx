import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HotelCard from "@/components/HotelCard";
import RestaurantSection from "@/components/RestaurantSection";
import SuvamRestaurantSection from "@/components/SuvamRestaurantSection";
import EventsSection from "@/components/EventsSection";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setHotels(data || []);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      
      <RestaurantSection />
      <SuvamRestaurantSection />
      
      {/* Hotels Section */}
      <section id="suvam" className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our Properties
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Two distinct experiences, one commitment to exceptional hospitality
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {hotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  id={hotel.id}
                  name={hotel.name}
                  tagline={hotel.description?.split('.')[0] || "Experience exceptional hospitality"}
                  description={hotel.description || ""}
                  image={hotel.images?.[0] || "/placeholder.svg"}
                  features={hotel.amenities?.slice(0, 4) || []}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      
      <EventsSection />
      <Footer />
    </div>
  );
};

export default Index;
