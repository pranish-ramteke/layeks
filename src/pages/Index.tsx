import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HotelCard from "@/components/HotelCard";
import RestaurantSection from "@/components/RestaurantSection";
import EventsSection from "@/components/EventsSection";
import Footer from "@/components/Footer";
import roomPreview from "@/assets/room-preview.jpg";
import heroHotel from "@/assets/hero-hotel.jpg";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      
      {/* Hotels Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our Properties
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Two distinct experiences, one commitment to exceptional hospitality
            </p>
          </div>
          
          <div id="suvam" className="grid md:grid-cols-2 gap-8 mb-8">
            <HotelCard
              name="Hotel Suvam"
              tagline="Your Trusted Home Since 1995"
              description="Experience time-tested hospitality at our established property. Hotel Suvam offers comfortable accommodations with modern amenities while maintaining its classic charm."
              image={heroHotel}
              features={[
                "45 Well-appointed rooms",
                "24/7 Room Service",
                "Free Wi-Fi throughout",
                "Complimentary Breakfast"
              ]}
            />
            
            <HotelCard
              name="Hotel Atithi"
              tagline="Modern Comfort, Traditional Warmth"
              description="Discover our newest property that blends contemporary design with warm Indian hospitality. Perfect for both business and leisure travelers."
              image={roomPreview}
              features={[
                "35 Modern rooms with city views",
                "State-of-the-art facilities",
                "Premium dining experience",
                "Conference facilities"
              ]}
              isNew={true}
            />
          </div>
        </div>
      </section>
      
      <RestaurantSection />
      <EventsSection />
      <Footer />
    </div>
  );
};

export default Index;
