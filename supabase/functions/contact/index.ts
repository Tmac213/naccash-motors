// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://cloafnxpreotjbxfbohb.supabase.co';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'content-type',
      },
    });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  // POST /contact - Send inquiry
  if (req.method === 'POST' && path === '/contact') {
    try {
      const { firstName, lastName, email, message } = await req.json();

      if (!firstName || !lastName || !email || !message) {
        return new Response(JSON.stringify({ error: 'All fields are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Get settings to find the recipient email
      const { data: settings } = await supabase
        .from('settings')
        .select('email')
        .eq('id', 1)
        .single();

      const recipientEmail = settings?.email || 'info@naccashmotors.com';

      // TODO: Configure email transporter (using Resend, SendGrid, or similar)
      // For now, we'll just return success
      // In production, you would integrate with an email service like:
      // - Resend (https://resend.com)
      // - SendGrid (https://sendgrid.com)
      // - AWS SES
      // - Supabase Email (if available)

      console.log(`Contact inquiry from ${firstName} ${lastName} (${email}): ${message}`);
      console.log(`Would send to: ${recipientEmail}`);

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Inquiry received! We will get back to you soon.' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (error: any) {
      console.error('Error sending inquiry:', error);
      return new Response(JSON.stringify({ error: 'Failed to send inquiry. Please try again.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
});
