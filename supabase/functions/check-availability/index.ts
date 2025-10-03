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
    const { hotel_id, check_in, check_out, num_guests } = await req.json();

    console.log('Checking availability for:', { hotel_id, check_in, check_out, num_guests });

    if (!hotel_id || !check_in || !check_out || !num_guests) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch all room types for this hotel
    const { data: roomTypes, error: roomTypesError } = await supabase
      .from('room_types')
      .select('*')
      .eq('hotel_id', hotel_id)
      .gte('max_guests', num_guests);

    if (roomTypesError) {
      console.error('Error fetching room types:', roomTypesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch room types' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For each room type, check availability
    const availableRoomTypes = [];

    for (const roomType of roomTypes || []) {
      // Get all rooms of this type
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('id')
        .eq('room_type_id', roomType.id)
        .eq('status', 'available');

      if (roomsError) {
        console.error('Error fetching rooms:', roomsError);
        continue;
      }

      if (!rooms || rooms.length === 0) continue;

      const roomIds = rooms.map(r => r.id);

      // Check for booking conflicts
      const { data: conflictingBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('room_id')
        .in('room_id', roomIds)
        .in('status', ['confirmed', 'pending'])
        .or(`and(check_in_date.lte.${check_out},check_out_date.gte.${check_in})`);

      if (bookingsError) {
        console.error('Error checking bookings:', bookingsError);
        continue;
      }

      const bookedRoomIds = new Set(conflictingBookings?.map(b => b.room_id) || []);
      const availableRooms = rooms.filter(r => !bookedRoomIds.has(r.id));

      if (availableRooms.length > 0) {
        // Check for custom pricing in room_availability
        const { data: priceOverride } = await supabase
          .from('room_availability')
          .select('price_override')
          .in('room_id', availableRooms.map(r => r.id))
          .gte('date', check_in)
          .lte('date', check_out)
          .eq('is_available', true)
          .limit(1)
          .single();

        const pricePerNight = priceOverride?.price_override || roomType.base_price_per_night;

        availableRoomTypes.push({
          ...roomType,
          price_per_night: pricePerNight,
          available_rooms_count: availableRooms.length
        });
      }
    }

    console.log('Available room types:', availableRoomTypes);

    return new Response(
      JSON.stringify({ available_room_types: availableRoomTypes }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-availability:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
