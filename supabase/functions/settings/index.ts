// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verify } from 'https://deno.land/x/djwt@v3.0.2/mod.ts';

// JWT Secret for token verification
const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'p4l2IQdbq7ZAq5oGyicEzpz2JCXEOpj9';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://cloafnxpreotjbxfbohb.supabase.co';
const supabaseKey = Deno.env.get('SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// Verify JWT token
async function verifyToken(authHeader: string | null): Promise<{ valid: boolean; userId?: string }> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false };
  }

  const token = authHeader.substring(7);

  try {
    const payload = await verify(token, JWT_SECRET);
    return { valid: true, userId: payload.userId as string };
  } catch (error) {
    console.error('Token verification failed:', error);
    return { valid: false };
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  // GET /settings - Get settings (Public)
  if (req.method === 'GET' && path === '/settings') {
    try {
      const { data: settings, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        // Create default settings if not exists
        const { data: newSettings, error: createError } = await supabase
          .from('settings')
          .insert({
            id: 1,
            whatsappNumber: '+96181877675',
            instagramUrl: '',
            tiktokUrl: '',
            email: 'info@naccashmotors.com',
            phoneNumber: '+961 81 877 675',
            address: 'Lebanon'
          })
          .select()
          .single();

        if (createError) throw createError;

        return new Response(JSON.stringify(newSettings), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      return new Response(JSON.stringify(settings), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch settings' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // PUT /settings - Update settings (Admin only)
  if (req.method === 'PUT' && path === '/settings') {
    const authResult = await verifyToken(req.headers.get('authorization'));
    if (!authResult.valid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const body = await req.json();
      const { whatsappNumber, instagramUrl, tiktokUrl, facebookUrl, email, phoneNumber, address, aboutUsText } = body;

      const { data: settings, error } = await supabase
        .from('settings')
        .upsert({
          id: 1,
          whatsappNumber,
          instagramUrl,
          tiktokUrl,
          facebookUrl,
          email,
          phoneNumber,
          address,
          aboutUsText
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(settings), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (error: any) {
      console.error('Error updating settings:', error);
      return new Response(JSON.stringify({ error: 'Failed to update settings' }), {
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
