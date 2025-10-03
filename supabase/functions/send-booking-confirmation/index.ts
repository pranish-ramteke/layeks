import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { booking_id } = await req.json();

    console.log('Sending confirmation for booking:', booking_id);

    if (!booking_id) {
      return new Response(
        JSON.stringify({ error: 'Missing booking_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch booking with related data
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        hotels(name, address, phone, email),
        room_types(name, description),
        profiles(email, full_name)
      `)
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      console.error('Booking error:', bookingError);
      return new Response(
        JSON.stringify({ error: 'Booking not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userEmail = booking.profiles?.email;
    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: 'User email not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format dates
    const checkIn = new Date(booking.check_in_date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const checkOut = new Date(booking.check_out_date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Create email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .booking-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; }
            .total { font-size: 1.2em; color: #d4af37; font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Confirmation</h1>
              <p>Reference: ${booking.booking_reference}</p>
            </div>
            
            <div class="content">
              <p>Dear ${booking.profiles?.full_name || 'Guest'},</p>
              <p>Thank you for your booking! Your reservation has been confirmed.</p>
              
              <div class="booking-details">
                <h2>Booking Details</h2>
                
                <div class="detail-row">
                  <span class="detail-label">Hotel:</span>
                  <span>${booking.hotels?.name}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Room Type:</span>
                  <span>${booking.room_types?.name}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Check-in:</span>
                  <span>${checkIn}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Check-out:</span>
                  <span>${checkOut}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Number of Nights:</span>
                  <span>${booking.num_nights}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Number of Guests:</span>
                  <span>${booking.num_guests}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Room Rate (per night):</span>
                  <span>₹${Number(booking.room_rate).toFixed(2)}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Subtotal:</span>
                  <span>₹${(Number(booking.room_rate) * booking.num_nights).toFixed(2)}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Taxes (18%):</span>
                  <span>₹${Number(booking.taxes).toFixed(2)}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label total">Total Amount:</span>
                  <span class="total">₹${Number(booking.total_amount).toFixed(2)}</span>
                </div>
              </div>
              
              <div class="booking-details">
                <h2>Hotel Information</h2>
                <p><strong>Address:</strong> ${booking.hotels?.address || 'N/A'}</p>
                <p><strong>Phone:</strong> ${booking.hotels?.phone || 'N/A'}</p>
                <p><strong>Email:</strong> ${booking.hotels?.email || 'N/A'}</p>
              </div>
              
              <p>Please arrive at the hotel after 2:00 PM on your check-in date. Check-out time is 11:00 AM.</p>
              <p>If you have any questions, please don't hesitate to contact us.</p>
            </div>
            
            <div class="footer">
              <p>Thank you for choosing us!</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Booking Confirmation <onboarding@resend.dev>",
      to: [userEmail],
      subject: `Booking Confirmation - ${booking.booking_reference}`,
      html: emailHtml,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: 'Confirmation email sent' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-booking-confirmation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
