import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Phone, Menu, LogOut, User } from "lucide-react";
import layeksLogo from "@/assets/layeks-logo-2.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out successfully",
      description: "You have been signed out.",
    });
    navigate("/");
  };

  const getUserInitials = () => {
    if (!user) return "U";
    const email = user.email || "";
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-soft transition-all duration-500 ease-in-out">
      <nav className={`container mx-auto px-4 flex items-center justify-between transition-all duration-500 ease-in-out ${isScrolled ? 'h-8 md:h-10' : 'h-16 md:h-20'}`}>
        <div className="flex items-center gap-2">
          <img src={layeksLogo} alt="Layek's Logo" className={`rounded-full object-cover transition-all duration-500 ease-in-out ${isScrolled ? 'h-4 w-4 md:h-5 md:w-5' : 'h-8 w-8 md:h-10 md:w-10'}`} />
          <div className="transition-all duration-500 ease-in-out">
            <h1 className={`font-serif font-bold text-foreground transition-all duration-500 ease-in-out ${isScrolled ? 'text-sm md:text-base' : 'text-lg md:text-xl'}`}>Layek's</h1>
            <p className={`text-muted-foreground transition-all duration-500 ease-in-out ${isScrolled ? 'hidden' : 'text-xs hidden sm:block'}`}>Decades of Hospitality</p>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <div className={`hidden md:flex items-center transition-all duration-500 ease-in-out ${isScrolled ? 'gap-4' : 'gap-8'}`}>
          <a href="#restaurant" className={`font-medium text-foreground hover:text-primary transition-all duration-500 ease-in-out ${isScrolled ? 'text-xs' : 'text-sm'}`}>
            Restaurants
          </a>
          <a href="#suvam" className={`font-medium text-foreground hover:text-primary transition-all duration-500 ease-in-out ${isScrolled ? 'text-xs' : 'text-sm'}`}>
            Hotel Suvam
          </a>
          <a href="#atithi" className={`font-medium text-foreground hover:text-primary transition-all duration-500 ease-in-out ${isScrolled ? 'text-xs' : 'text-sm'}`}>
            Hotel Atithi
          </a>
          <a href="#events" className={`font-medium text-foreground hover:text-primary transition-all duration-500 ease-in-out ${isScrolled ? 'text-xs' : 'text-sm'}`}>
            Events
          </a>
        </div>
        
        <div className="flex items-center gap-2">
          {/* User Profile or Book Button */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={`relative rounded-full transition-all duration-500 ease-in-out ${isScrolled ? 'h-7 w-7' : 'h-10 w-10'}`}>
                  <Avatar className={`transition-all duration-500 ease-in-out ${isScrolled ? 'h-7 w-7' : 'h-10 w-10'}`}>
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem disabled className="flex-col items-start">
                  <div className="font-medium">{user.user_metadata?.full_name || "User"}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              {/* Desktop Book Button */}
              <Button className={`hidden sm:flex bg-primary hover:bg-primary/90 text-primary-foreground shadow-warm transition-all duration-500 ease-in-out ${isScrolled ? 'h-7 text-xs px-3' : 'h-10 text-sm'}`}>
                <Phone className={`transition-all duration-500 ease-in-out ${isScrolled ? 'mr-1 h-3 w-3' : 'mr-2 h-4 w-4'}`} />
                Book Now
              </Button>
              
              {/* Mobile Book Button */}
              <Button className={`flex sm:hidden bg-primary hover:bg-primary/90 text-primary-foreground shadow-warm transition-all duration-500 ease-in-out ${isScrolled ? 'h-6 w-6 p-0' : 'h-9 w-9 p-0'}`}>
                <Phone className={`transition-all duration-500 ease-in-out ${isScrolled ? 'h-3 w-3' : 'h-4 w-4'}`} />
              </Button>
            </>
          )}
          
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={`md:hidden transition-all duration-500 ease-in-out ${isScrolled ? 'h-7 w-7' : 'h-10 w-10'}`}>
                <Menu className={`transition-all duration-500 ease-in-out ${isScrolled ? 'h-4 w-4' : 'h-6 w-6'}`} />
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
