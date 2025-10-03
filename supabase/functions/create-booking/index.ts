import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { room_type_id, hotel_id, check_in_date, check_out_date, num_guests } = await req.json();

    console.log('Creating booking:', { room_type_id, hotel_id, check_in_date, check_out_date, num_guests });

    if (!room_type_id || !hotel_id || !check_in_date || !check_out_date || !num_guests) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get room type details
    const { data: roomType, error: roomTypeError } = await supabase
      .from('room_types')
      .select('base_price_per_night')
      .eq('id', room_type_id)
      .single();

    if (roomTypeError || !roomType) {
      console.error('Room type error:', roomTypeError);
      return new Response(
        JSON.stringify({ error: 'Room type not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate number of nights
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const numNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate totals (18% GST in India)
    const roomRate = Number(roomType.base_price_per_night);
    const subtotal = roomRate * numNights;
    const taxes = subtotal * 0.18;
    const totalAmount = subtotal + taxes;

    // Generate booking reference
    const bookingReference = `BK${Date.now().toString(36).toUpperCase()}`;

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        hotel_id,
        room_type_id,
        check_in_date,
        check_out_date,
        num_guests,
        num_nights: numNights,
        room_rate: roomRate,
        taxes,
        total_amount: totalAmount,
        booking_reference: bookingReference,
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Booking creation error:', bookingError);
      return new Response(
        JSON.stringify({ error: 'Failed to create booking' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Booking created successfully:', booking.id);

    return new Response(
      JSON.stringify({ booking }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-booking:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
