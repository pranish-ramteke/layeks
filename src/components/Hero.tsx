import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import landingImage from "@/assets/landing-image.jpg";
const Hero = () => {
  return <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{
      backgroundImage: `url(${landingImage})`
    }} />
      <div className="absolute inset-0 bg-gradient-hero" />
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="font-serif text-5xl md:text-7xl font-bold text-primary-foreground mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">Layek's Stay & Dine</h1>
        <p className="text-xl md:text-2xl text-primary-foreground/90 mb-4 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
          Experience the warmth of Indian hospitality in Durgapur
        </p>
        <p className="text-lg text-primary-foreground/80 mb-12 max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">Cozy rooms, rustic charm, and unforgettable moments await you</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-warm text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6" onClick={() => document.getElementById('restaurant')?.scrollIntoView({
          behavior: 'smooth'
        })}>
            View Restaurants
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button size="lg" variant="outline" className="bg-background/20 backdrop-blur-sm border-primary-foreground/30 text-primary-foreground hover:bg-background/30 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6" onClick={() => document.getElementById('suvam')?.scrollIntoView({
          behavior: 'smooth'
        })}>
            Explore Our Hotels
          </Button>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-primary-foreground/50 rounded-full"></div>
        </div>
      </div>
    </section>;
};
export default Hero;