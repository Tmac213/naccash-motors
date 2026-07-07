// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { verify } from 'https://deno.land/x/djwt@v3.0.2/mod.ts';

const NHTSA_BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles';

// JWT Secret for token verification
const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'p4l2IQdbq7ZAq5oGyicEzpz2JCXEOpj9';

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
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  // GET /nhtsa/makes - Get All Car Makes (Brands)
  if (req.method === 'GET' && path === '/nhtsa/makes') {
    const authResult = await verifyToken(req.headers.get('authorization'));
    if (!authResult.valid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const response = await fetch(`${NHTSA_BASE_URL}/GetAllMakes?format=json`);
      const data = await response.json();
      
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (error) {
      console.error('Error fetching makes:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch car makes' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // GET /nhtsa/models/:make/:year - Get Models by Make and Year
  if (req.method === 'GET' && path.match(/^\/nhtsa\/models\/[^\/]+\/\d+$/)) {
    const authResult = await verifyToken(req.headers.get('authorization'));
    if (!authResult.valid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const pathParts = path.split('/');
    const make = pathParts[3];
    const year = pathParts[4];

    try {
      const response = await fetch(`${NHTSA_BASE_URL}/GetModelsForMakeYear/make/${make}/modelyear/${year}?format=json`);
      const data = await response.json();
      
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (error) {
      console.error(`Error fetching models for make: ${make}, year: ${year}`, error);
      return new Response(JSON.stringify({ error: 'Failed to fetch car models' }), {
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
