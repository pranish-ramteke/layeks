import { Flower, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Flower className="h-8 w-8 text-accent" />
              <div>
                <h3 className="font-serif text-xl font-bold">The Layek's</h3>
                <p className="text-sm text-background/70">Decades of Hospitality</p>
              </div>
            </div>
            <p className="text-background/80 text-sm">
              Bringing warmth and comfort to travelers in Durgapur for nearly three decades.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-accent">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#suvam" className="text-background/80 hover:text-accent transition-colors">Hotel Suvam</a></li>
              <li><a href="#atithi" className="text-background/80 hover:text-accent transition-colors">Hotel Atithi</a></li>
              <li><a href="#restaurant" className="text-background/80 hover:text-accent transition-colors">Restaurant</a></li>
              <li><a href="#events" className="text-background/80 hover:text-accent transition-colors">Events</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-accent">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-1 text-accent flex-shrink-0" />
                <div>
                  <p className="text-background/80">+91 98765 43210</p>
                  <p className="text-background/80">+91 98765 43211</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-1 text-accent flex-shrink-0" />
                <a href="mailto:info@suvamatithi.com" className="text-background/80 hover:text-accent transition-colors">
                  info@suvamatithi.com
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-accent">Location</h4>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 mt-1 text-accent flex-shrink-0" />
              <address className="text-background/80 not-italic">
                City Centre,<br />
                Durgapur - 713216,<br />
                West Bengal, India
              </address>
            </div>
          </div>
        </div>
        
        <div className="border-t border-background/20 pt-8 text-center text-sm text-background/60">
          <p>&copy; {new Date().getFullYear()} The Layek's. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
