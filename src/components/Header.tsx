import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Flower, Phone, Menu } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-soft">
      <nav className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flower className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          <div>
            <h1 className="font-serif text-lg md:text-xl font-bold text-foreground">The Layek's</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Decades of Hospitality</p>
          </div>
        </div>
        
        {/* Desktop Navigation */}
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
        
        <div className="flex items-center gap-2">
          {/* Desktop Book Button */}
          <Button className="hidden sm:flex bg-primary hover:bg-primary/90 text-primary-foreground shadow-warm transition-all duration-300">
            <Phone className="mr-2 h-4 w-4" />
            Book Now
          </Button>
          
          {/* Mobile Book Button */}
          <Button size="sm" className="flex sm:hidden bg-primary hover:bg-primary/90 text-primary-foreground shadow-warm">
            <Phone className="h-4 w-4" />
          </Button>
          
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-6 mt-8">
                <a 
                  href="#restaurant" 
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('restaurant')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Restaurants
                </a>
                <a 
                  href="#suvam" 
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('suvam')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Hotel Suvam
                </a>
                <a 
                  href="#atithi" 
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('suvam')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Hotel Atithi
                </a>
                <a 
                  href="#events" 
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Events
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

export default Header;
