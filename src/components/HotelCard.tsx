import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Star, ArrowRight } from "lucide-react";

interface HotelCardProps {
  name: string;
  tagline: string;
  description: string;
  image: string;
  features: string[];
  isNew?: boolean;
}

const HotelCard = ({ name, tagline, description, image, features, isNew }: HotelCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-warm transition-all duration-500 border-border group">
      <div className="relative h-80 md:h-96 overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {isNew && (
          <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
            New Property
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
      </div>
      
      <CardContent className="p-6 sm:p-8 bg-gradient-card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2">{name}</h3>
            <p className="text-sm md:text-base text-primary font-medium">{tagline}</p>
          </div>
          <Building2 className="h-6 w-6 md:h-8 md:w-8 text-primary flex-shrink-0" />
        </div>
        
        <p className="text-muted-foreground mb-6 leading-relaxed">{description}</p>
        
        <div className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <Star className="h-4 w-4 text-accent fill-accent" />
              <span className="text-sm text-foreground">{feature}</span>
            </div>
          ))}
        </div>
        
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft group">
          Explore {name}
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default HotelCard;
