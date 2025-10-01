import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Utensils, ChefHat, Clock, ArrowRight } from "lucide-react";
import laEkImage from "@/assets/la-ek.jpg";

const RestaurantSection = () => {
  return (
    <section id="restaurant" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            La Ek Essence
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Savor authentic flavors in a warm, rustic ambiance
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="order-2 md:order-1">
            <Card className="border-border shadow-soft">
              <CardContent className="p-6 sm:p-8">
                <h3 className="font-serif text-2xl font-bold text-foreground mb-6">
                  Our Culinary Experience
                </h3>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Utensils className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Authentic Cuisine</h4>
                      <p className="text-sm text-muted-foreground">
                        Traditional Indian dishes with a modern twist, prepared by expert chefs
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <ChefHat className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Expert Chefs</h4>
                      <p className="text-sm text-muted-foreground">
                        Culinary masters bringing decades of experience to every dish
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">All Day Dining</h4>
                      <p className="text-sm text-muted-foreground">
                        Open from 7 AM to 11 PM, serving breakfast, lunch, and dinner
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8">
                  <Button 
                    className="w-full sm:flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-warm group"
                    onClick={() => window.open('/sample-menu.pdf', '_blank')}
                  >
                    View Full Menu
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full sm:flex-1 border-primary text-primary hover:bg-primary/10"
                  >
                    View Gallery
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="order-1 md:order-2">
            <div className="relative rounded-2xl overflow-hidden shadow-warm h-[400px] md:h-[500px]">
              <img 
                src={laEkImage} 
                alt="La Ek Essence Restaurant"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-primary-foreground text-lg font-medium">
                  "Where every meal becomes a cherished memory"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RestaurantSection;
