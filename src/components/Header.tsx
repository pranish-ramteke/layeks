import { Button } from "@/components/ui/button";
import { Flower, Phone } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-soft">
      <nav className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flower className="h-8 w-8 text-primary" />
          <div>
            <h1 className="font-serif text-xl font-bold text-foreground">The Layek's</h1>
            <p className="text-xs text-muted-foreground">Decades of Hospitality</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#restaurant" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Restaurants
          </a>
          <a href="#suvam" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Hotel Suvam
          </a>
          <a href="#atithi" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Hotel Atithi
          </a>
          <a href="#events" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Events
          </a>
        </div>
        
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-warm transition-all duration-300">
          <Phone className="mr-2 h-4 w-4" />
          Book Now
        </Button>
      </nav>
    </header>
  );
};

export default Header;
