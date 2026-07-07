// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verify } from 'https://deno.land/x/djwt@v3.0.2/mod.ts';

// JWT Secret for token verification
const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'p4l2IQdbq7ZAq5oGyicEzpz2JCXEOpj9';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://cloafnxpreotjbxfbohb.supabase.co';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';

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

// Strip private financial fields for public access
function stripPrivateFields(vehicle: any) {
  const { purchaseCost, shippingCost, customsCost, maintenanceCost, otherCosts, soldPrice, ...safeData } = vehicle;
  return safeData;
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  // GET /inventory - Get all public vehicles
  if (req.method === 'GET' && path === '/inventory') {
    try {
      const { data: vehicles, error } = await supabase
        .from('vehicles')
        .select('*')
        .neq('status', 'Hidden')
        .order('createdAt', { ascending: false });

      if (error) throw error;

      const publicVehicles = vehicles.map(stripPrivateFields);

      return new Response(JSON.stringify(publicVehicles), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (error: any) {
      console.error('Error fetching vehicles:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch vehicles' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // GET /inventory/admin - Get all vehicles including hidden (Admin only)
  if (req.method === 'GET' && path === '/inventory/admin') {
    const authResult = await verifyToken(req.headers.get('authorization'));
    if (!authResult.valid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const { data: vehicles, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify(vehicles), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (error: any) {
      console.error('Error fetching admin vehicles:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch vehicles' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // GET /inventory/:id - Get single vehicle by ID
  if (req.method === 'GET' && path.match(/^\/inventory\/\d+$/)) {
    const id = path.split('/').pop();
    
    try {
      const { data: vehicle, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !vehicle) {
        return new Response(JSON.stringify({ error: 'Vehicle not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const safeVehicle = stripPrivateFields(vehicle);

      return new Response(JSON.stringify(safeVehicle), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (error: any) {
      console.error('Error fetching vehicle:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch vehicle' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // POST /inventory - Create new vehicle (Admin only)
  if (req.method === 'POST' && path === '/inventory') {
    const authResult = await verifyToken(req.headers.get('authorization'));
    if (!authResult.valid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const body = await req.json();
      
      const { data: vehicle, error } = await supabase
        .from('vehicles')
        .insert({
          ...body,
          year: body.year ? parseInt(body.year) : null,
          mileage: body.mileage ? parseInt(body.mileage) : null,
          price: body.price ? parseFloat(body.price) : null,
          purchaseCost: body.purchaseCost ? parseFloat(body.purchaseCost) : null,
          shippingCost: body.shippingCost ? parseFloat(body.shippingCost) : null,
          customsCost: body.customsCost ? parseFloat(body.customsCost) : null,
          maintenanceCost: body.maintenanceCost ? parseFloat(body.maintenanceCost) : null,
          otherCosts: body.otherCosts ? parseFloat(body.otherCosts) : null,
          soldPrice: body.soldPrice ? parseFloat(body.soldPrice) : null,
          images: Array.isArray(body.images) ? JSON.stringify(body.images) : (body.images || null),
          videos: Array.isArray(body.videos) ? JSON.stringify(body.videos) : (body.videos || null),
          specialPackages: Array.isArray(body.specialPackages) ? JSON.stringify(body.specialPackages) : (body.specialPackages || null),
          techFeatures: Array.isArray(body.techFeatures) ? JSON.stringify(body.techFeatures) : (body.techFeatures || null),
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(vehicle), {
        status: 201,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (error: any) {
      console.error('Error creating vehicle:', error);
      return new Response(JSON.stringify({ error: 'Failed to create vehicle' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // PUT /inventory/:id - Update vehicle (Admin only)
  if (req.method === 'PUT' && path.match(/^\/inventory\/\d+$/)) {
    const authResult = await verifyToken(req.headers.get('authorization'));
    if (!authResult.valid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const id = path.split('/').pop();

    try {
      const body = await req.json();
      
      const updateData: any = { ...body };
      if (updateData.year !== undefined) updateData.year = updateData.year ? parseInt(updateData.year) : null;
      if (updateData.mileage !== undefined) updateData.mileage = updateData.mileage ? parseInt(updateData.mileage) : null;
      if (updateData.price !== undefined) updateData.price = updateData.price ? parseFloat(updateData.price) : null;
      if (updateData.purchaseCost !== undefined) updateData.purchaseCost = updateData.purchaseCost ? parseFloat(updateData.purchaseCost) : null;
      if (updateData.shippingCost !== undefined) updateData.shippingCost = updateData.shippingCost ? parseFloat(updateData.shippingCost) : null;
      if (updateData.customsCost !== undefined) updateData.customsCost = updateData.customsCost ? parseFloat(updateData.customsCost) : null;
      if (updateData.maintenanceCost !== undefined) updateData.maintenanceCost = updateData.maintenanceCost ? parseFloat(updateData.maintenanceCost) : null;
      if (updateData.otherCosts !== undefined) updateData.otherCosts = updateData.otherCosts ? parseFloat(updateData.otherCosts) : null;
      if (updateData.soldPrice !== undefined) updateData.soldPrice = updateData.soldPrice ? parseFloat(updateData.soldPrice) : null;
      if (updateData.images !== undefined && Array.isArray(updateData.images)) updateData.images = JSON.stringify(updateData.images);
      if (updateData.videos !== undefined && Array.isArray(updateData.videos)) updateData.videos = JSON.stringify(updateData.videos);
      if (updateData.specialPackages !== undefined && Array.isArray(updateData.specialPackages)) updateData.specialPackages = JSON.stringify(updateData.specialPackages);
      if (updateData.techFeatures !== undefined && Array.isArray(updateData.techFeatures)) updateData.techFeatures = JSON.stringify(updateData.techFeatures);

      const { data: vehicle, error } = await supabase
        .from('vehicles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(vehicle), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (error: any) {
      console.error('Error updating vehicle:', error);
      return new Response(JSON.stringify({ error: 'Failed to update vehicle' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // DELETE /inventory/:id - Delete vehicle (Admin only)
  if (req.method === 'DELETE' && path.match(/^\/inventory\/\d+$/)) {
    const authResult = await verifyToken(req.headers.get('authorization'));
    if (!authResult.valid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const id = path.split('/').pop();

    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return new Response(JSON.stringify({ message: 'Vehicle deleted successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (error: any) {
      console.error('Error deleting vehicle:', error);
      return new Response(JSON.stringify({ error: 'Failed to delete vehicle' }), {
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
