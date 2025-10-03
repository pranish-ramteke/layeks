import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');

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

    const { booking_id, reason } = await req.json();

    console.log('Canceling booking:', booking_id);

    if (!booking_id) {
      return new Response(
        JSON.stringify({ error: 'Missing booking_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, payments(*)')
      .eq('id', booking_id)
      .eq('user_id', user.id)
      .single();

    if (bookingError || !booking) {
      console.error('Booking error:', bookingError);
      return new Response(
        JSON.stringify({ error: 'Booking not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return new Response(
        JSON.stringify({ error: 'Booking is already cancelled' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (booking.status === 'completed') {
      return new Response(
        JSON.stringify({ error: 'Cannot cancel completed booking' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check cancellation policy (24 hours before check-in for full refund)
    const checkInDate = new Date(booking.check_in_date);
    const now = new Date();
    const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    let refundAmount = 0;
    let refundPercentage = 0;

    if (hoursUntilCheckIn > 24) {
      // Full refund
      refundPercentage = 100;
      refundAmount = Number(booking.total_amount);
    } else if (hoursUntilCheckIn > 0) {
      // Partial refund (50%)
      refundPercentage = 50;
      refundAmount = Number(booking.total_amount) * 0.5;
    }
    // else no refund

    // Process refund if applicable and payment was completed
    let refundStatus = 'not_applicable';
    let refundId = null;

    if (refundAmount > 0 && booking.payment_status === 'completed' && booking.payments?.length > 0) {
      const payment = booking.payments[0];
      
      if (payment.payment_method !== 'cash' && payment.transaction_id) {
        // Process refund through Razorpay
        try {
          const refundData = {
            amount: Math.round(refundAmount * 100), // Convert to paise
            speed: 'normal',
            notes: {
              booking_id: booking.id,
              reason: reason || 'Customer cancellation'
            }
          };

          const refundResponse = await fetch(
            `https://api.razorpay.com/v1/payments/${payment.transaction_id}/refund`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`
              },
              body: JSON.stringify(refundData)
            }
          );

          if (refundResponse.ok) {
            const refundResult = await refundResponse.json();
            refundId = refundResult.id;
            refundStatus = 'initiated';
            console.log('Refund initiated:', refundId);
          } else {
            console.error('Refund failed:', await refundResponse.text());
            refundStatus = 'failed';
          }
        } catch (error) {
          console.error('Error processing refund:', error);
          refundStatus = 'failed';
        }
      } else {
        // Cash payment - mark for manual refund
        refundStatus = 'pending_manual';
      }
    }

    // Update booking status
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        payment_status: refundAmount > 0 ? 'refunded' : booking.payment_status
      })
      .eq('id', booking_id);

    if (updateError) {
      console.error('Booking update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to cancel booking' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Booking cancelled successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Booking cancelled successfully',
        refund_amount: refundAmount,
        refund_percentage: refundPercentage,
        refund_status: refundStatus,
        refund_id: refundId
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in cancel-booking:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
