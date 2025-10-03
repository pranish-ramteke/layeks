import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import HotelDetails from "./pages/HotelDetails";
import BookingSummary from "./pages/BookingSummary";
import GuestInfo from "./pages/GuestInfo";
import Payment from "./pages/Payment";
import Confirmation from "./pages/Confirmation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/hotels/:hotelId" element={<HotelDetails />} />
          <Route path="/booking/:bookingId/summary" element={<BookingSummary />} />
          <Route path="/booking/:bookingId/guest-info" element={<GuestInfo />} />
          <Route path="/booking/:bookingId/payment" element={<Payment />} />
          <Route path="/booking/:bookingId/confirmation" element={<Confirmation />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
