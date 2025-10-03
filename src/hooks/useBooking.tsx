import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { differenceInDays } from "date-fns";

export interface BookingState {
  hotelId?: string;
  roomTypeId?: string;
  checkIn?: Date;
  checkOut?: Date;
  numGuests: number;
  numNights: number;
  roomRate: number;
  taxes: number;
  totalAmount: number;
}

const BOOKING_STORAGE_KEY = "hotel_booking_state";
const TAX_RATE = 0.12; // 12% GST

export function useBooking() {
  const [bookingState, setBookingState] = useState<BookingState>(() => {
    const stored = localStorage.getItem(BOOKING_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          checkIn: parsed.checkIn ? new Date(parsed.checkIn) : undefined,
          checkOut: parsed.checkOut ? new Date(parsed.checkOut) : undefined,
        };
      } catch {
        return {
          numGuests: 1,
          numNights: 0,
          roomRate: 0,
          taxes: 0,
          totalAmount: 0,
        };
      }
    }
    return {
      numGuests: 1,
      numNights: 0,
      roomRate: 0,
      taxes: 0,
      totalAmount: 0,
    };
  });

  useEffect(() => {
    localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(bookingState));
  }, [bookingState]);

  const updateBooking = (updates: Partial<BookingState>) => {
    setBookingState((prev) => {
      const updated = { ...prev, ...updates };

      // Recalculate if dates or room rate change
      if (updated.checkIn && updated.checkOut) {
        updated.numNights = differenceInDays(updated.checkOut, updated.checkIn);
      }

      if (updated.numNights && updated.roomRate) {
        const subtotal = updated.roomRate * updated.numNights;
        updated.taxes = subtotal * TAX_RATE;
        updated.totalAmount = subtotal + updated.taxes;
      }

      return updated;
    });
  };

  const setDateRange = (dateRange: DateRange | undefined) => {
    if (dateRange?.from && dateRange?.to) {
      updateBooking({
        checkIn: dateRange.from,
        checkOut: dateRange.to,
      });
    }
  };

  const clearBooking = () => {
    localStorage.removeItem(BOOKING_STORAGE_KEY);
    setBookingState({
      numGuests: 1,
      numNights: 0,
      roomRate: 0,
      taxes: 0,
      totalAmount: 0,
    });
  };

  return {
    bookingState,
    updateBooking,
    setDateRange,
    clearBooking,
  };
}
