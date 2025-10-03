import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HotelCard from "@/components/HotelCard";
import RestaurantSection from "@/components/RestaurantSection";
import SuvamRestaurantSection from "@/components/SuvamRestaurantSection";
import EventsSection from "@/components/EventsSection";
import Footer from "@/components/Footer";
import hotelSuvamImage from "@/assets/hotel-suvam.jpg";
import hotelAtithiImage from "@/assets/hotel-atithi.jpg";

const Index = () => {
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
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <HotelCard
              id="11111111-1111-1111-1111-111111111111"
              name="Hotel Suvam"
              tagline="Your Trusted Home Since 2010"
              description="Experience time-tested hospitality at our established property. Hotel Suvam offers comfortable accommodations with modern amenities while maintaining its classic charm."
              image={hotelSuvamImage}
              features={[
                "45 Well-appointed rooms",
                "24/7 Room Service",
                "Free Wi-Fi throughout",
                "Complimentary Breakfast"
              ]}
            />
            
            <HotelCard
              id="22222222-2222-2222-2222-222222222222"
              name="Hotel Atithi"
              tagline="Modern Comfort, Traditional Warmth"
              description="Discover our newest property that blends contemporary design with warm Indian hospitality. Perfect for both business and leisure travelers."
              image={hotelAtithiImage}
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
      
      <EventsSection />
      <Footer />
    </div>
  );
};

export default Index;
