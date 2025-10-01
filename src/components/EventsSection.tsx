import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, PartyPopper, ArrowRight } from "lucide-react";

const EventsSection = () => {
  return (
    <section id="events" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Host Your Special Events
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From intimate gatherings to grand celebrations, we make every moment memorable
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="border-border shadow-soft hover:shadow-warm transition-all duration-300">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-3">Weddings</h3>
              <p className="text-muted-foreground text-sm">
                Create unforgettable wedding memories in our elegant venues
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-border shadow-soft hover:shadow-warm transition-all duration-300">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-3">Corporate Events</h3>
              <p className="text-muted-foreground text-sm">
                Professional spaces perfect for meetings, conferences, and seminars
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-border shadow-soft hover:shadow-warm transition-all duration-300">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <PartyPopper className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-3">Social Gatherings</h3>
              <p className="text-muted-foreground text-sm">
                Birthday parties, anniversaries, and celebrations of all kinds
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="max-w-xl mx-auto text-center">
          <Card className="border-primary/20 shadow-warm bg-gradient-card">
            <CardContent className="p-6 sm:p-8">
              <h3 className="font-serif text-2xl font-bold text-foreground mb-4">
                Ready to Plan Your Event?
              </h3>
              <p className="text-muted-foreground mb-6">
                Let us help you create the perfect celebration. Our team is ready to assist with all your event needs.
              </p>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-warm group w-full sm:w-auto">
                Request Event Consultation
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
