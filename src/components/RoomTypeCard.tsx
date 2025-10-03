import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Users } from "lucide-react";

interface RoomTypeCardProps {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  amenities: string[];
  images: string[];
  onReserve: (roomTypeId: string) => void;
  numNights?: number;
}

export function RoomTypeCard({
  id,
  name,
  description,
  pricePerNight,
  maxGuests,
  amenities,
  images,
  onReserve,
  numNights = 1,
}: RoomTypeCardProps) {
  const totalPrice = pricePerNight * numNights;

  return (
    <Card className="overflow-hidden hover:shadow-warm transition-all duration-300 group">
      <div className="relative h-64 overflow-hidden">
        <img
          src={images[0] || "/placeholder.svg"}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-foreground mb-1">{name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Up to {maxGuests} guests</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">₹{pricePerNight.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">per night</div>
          </div>
        </div>

        <p className="text-muted-foreground mb-4 leading-relaxed">{description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {amenities.slice(0, 4).map((amenity, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {amenity}
            </Badge>
          ))}
          {amenities.length > 4 && (
            <Badge variant="outline">+{amenities.length - 4} more</Badge>
          )}
        </div>

        {numNights > 1 && (
          <div className="mb-4 p-3 bg-accent/10 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total for {numNights} nights:</span>
              <span className="font-bold text-lg text-primary">₹{totalPrice.toLocaleString()}</span>
            </div>
          </div>
        )}

        <Button
          onClick={() => onReserve(id)}
          className="w-full bg-primary hover:bg-primary/90"
        >
          Reserve This Room
        </Button>
      </CardContent>
    </Card>
  );
}
