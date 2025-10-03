import { Minus, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GuestCounterProps {
  guests: number;
  onGuestsChange: (guests: number) => void;
  maxGuests?: number;
  className?: string;
}

export function GuestCounter({ guests, onGuestsChange, maxGuests = 10, className }: GuestCounterProps) {
  const increment = () => {
    if (guests < maxGuests) {
      onGuestsChange(guests + 1);
    }
  };

  const decrement = () => {
    if (guests > 1) {
      onGuestsChange(guests - 1);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-4">
        <Users className="h-5 w-5 text-muted-foreground" />
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={decrement}
            disabled={guests <= 1}
            className="h-8 w-8"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center font-semibold">{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={increment}
            disabled={guests >= maxGuests}
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
