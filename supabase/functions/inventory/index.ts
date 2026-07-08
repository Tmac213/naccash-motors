import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your_super_secret_jwt_key_change_me_in_production'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Simple JWT verification
async function verifyJWT(token: string): Promise<any> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = JSON.parse(atob(parts[1]))
    const now = Math.floor(Date.now() / 1000)
    
    if (payload.exp < now) return null
    
    return payload
  } catch {
    return null
  }
}

// Helper: parse JSON string fields into proper arrays
function parseVehicle(v: any) {
  const tryParse = (val: any) => {
    if (!val) return []
    if (Array.isArray(val)) return val
    try { return JSON.parse(val) } catch { return [] }
  }
  return {
    ...v,
    images: tryParse(v.images),
    videos: tryParse(v.videos),
    specialPackages: tryParse(v.specialPackages),
    techFeatures: tryParse(v.techFeatures),
  }
}

// Middleware to authenticate token
async function authenticateToken(req: Request): Promise<{ user?: any; error?: string }> {
  const authHeader = req.headers.get('authorization')
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return { error: 'Access denied, token missing' }
  }

  const user = await verifyJWT(token)
  if (!user) {
    return { error: 'Invalid or expired token' }
  }

  return { user }
}

serve(async (req) => {
  const url = new URL(req.url)
  // Remove /functions/v1/inventory prefix to get the actual path
  let path = url.pathname.replace(/^\/functions\/v1\/inventory/, '') || '/'
  // Also handle case where function name is not in path
  path = path.replace(/^\/inventory/, '') || '/'
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  }

  try {
    // GET /inventory - Get all vehicles (Public)
    if ((path === '/' || path === '' || path.endsWith('/') || path.endsWith('/inventory')) && req.method === 'GET') {
      const { data: vehicles, error } = await supabase
        .from('Vehicle')
        .select('*')
        .neq('status', 'Hidden')
        .order('createdAt', { ascending: false })

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch vehicles' }), {
          status: 500,
          headers,
        })
      }

      // Strip private financial fields
      const publicVehicles = vehicles.map(v => {
        const { purchaseCost, shippingCost, customsCost, maintenanceCost, otherCosts, soldPrice, ...safeData } = v
        return parseVehicle(safeData)
      })

      return new Response(JSON.stringify(publicVehicles), { headers })
    }

    // GET /inventory/admin - Get all vehicles including hidden (Admin only)
    if ((path === '/admin' || path.endsWith('/admin')) && req.method === 'GET') {
      const auth = await authenticateToken(req)
      if (auth.error) {
        return new Response(JSON.stringify({ error: auth.error }), {
          status: auth.error === 'Access denied, token missing' ? 401 : 403,
          headers,
        })
      }

      const { data: vehicles, error } = await supabase
        .from('Vehicle')
        .select('*')
        .order('createdAt', { ascending: false })

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch vehicles' }), {
          status: 500,
          headers,
        })
      }

      return new Response(JSON.stringify(vehicles.map(parseVehicle)), { headers })
    }

    // GET /inventory/:id - Get single vehicle (Public)
    if (path.match(/^\/\d+$/) && req.method === 'GET') {
      const id = path.slice(1)
      
      const { data: vehicle, error } = await supabase
        .from('Vehicle')
        .select('*')
        .eq('id', parseInt(id))
        .single()

      if (error || !vehicle) {
        return new Response(JSON.stringify({ error: 'Vehicle not found' }), {
          status: 404,
          headers,
        })
      }

      // Strip private financial fields
      const { purchaseCost, shippingCost, customsCost, maintenanceCost, otherCosts, soldPrice, ...safeData } = vehicle

      return new Response(JSON.stringify(parseVehicle(safeData)), { headers })
    }

    // POST /inventory - Add new vehicle (Admin only)
    if ((path === '/' || path.endsWith('/')) && req.method === 'POST') {
      const auth = await authenticateToken(req)
      if (auth.error) {
        return new Response(JSON.stringify({ error: auth.error }), {
          status: auth.error === 'Access denied, token missing' ? 401 : 403,
          headers,
        })
      }

      const body = await req.json()
      console.log('Create vehicle request:', body)
      const {
        vin, brand, year, model, trim, transmission, status, mileage, condition, price, description, image,
        images, videos,
        fuelType, engineCapacity, drivetrain, exteriorColor, interiorColor, bodyType,
        numberOfOwners, keys, regionalSpecs, sunroof, lighting, specialPackages, techFeatures,
        purchaseCost, shippingCost, customsCost, maintenanceCost, otherCosts, soldPrice
      } = body
      
      // Parse JSON strings for array fields
      const parsedImages = typeof images === 'string' ? JSON.parse(images) : (images || null)
      const parsedVideos = typeof videos === 'string' ? JSON.parse(videos) : (videos || null)
      const parsedSpecialPackages = typeof specialPackages === 'string' ? JSON.parse(specialPackages) : (specialPackages || null)
      const parsedTechFeatures = typeof techFeatures === 'string' ? JSON.parse(techFeatures) : (techFeatures || null)
      
      const { data: vehicle, error } = await supabase
        .from('Vehicle')
        .insert({
          vin, brand, model, trim,
          year: parseInt(year),
          transmission, status: status || 'Available',
          mileage: mileage ? parseInt(mileage) : null,
          condition,
          price: price ? parseFloat(price) : null,
          description, image: image || null,
          images: Array.isArray(parsedImages) ? JSON.stringify(parsedImages) : (parsedImages || null),
          videos: Array.isArray(parsedVideos) ? JSON.stringify(parsedVideos) : (parsedVideos || null),
          fuelType, engineCapacity, drivetrain,
          exteriorColor, interiorColor, bodyType,
          numberOfOwners, keys, regionalSpecs,
          sunroof, lighting,
          specialPackages: Array.isArray(parsedSpecialPackages) ? JSON.stringify(parsedSpecialPackages) : (parsedSpecialPackages || null),
          techFeatures: Array.isArray(parsedTechFeatures) ? JSON.stringify(parsedTechFeatures) : (parsedTechFeatures || null),
          purchaseCost: purchaseCost ? parseFloat(purchaseCost) : null,
          shippingCost: shippingCost ? parseFloat(shippingCost) : null,
          customsCost: customsCost ? parseFloat(customsCost) : null,
          maintenanceCost: maintenanceCost ? parseFloat(maintenanceCost) : null,
          otherCosts: otherCosts ? parseFloat(otherCosts) : null,
          soldPrice: soldPrice ? parseFloat(soldPrice) : null,
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase create error:', error)
        return new Response(JSON.stringify({ error: 'Failed to create vehicle', details: error.message }), {
          status: 500,
          headers,
        })
      }

      return new Response(JSON.stringify(vehicle), {
        status: 201,
        headers,
      })
    }

    // PUT /inventory/:id - Update vehicle (Admin only)
    if (path.match(/^\/\d+$/) && req.method === 'PUT') {
      const auth = await authenticateToken(req)
      if (auth.error) {
        return new Response(JSON.stringify({ error: auth.error }), {
          status: auth.error === 'Access denied, token missing' ? 401 : 403,
          headers,
        })
      }

      const id = path.slice(1)
      const body = await req.json()
      console.log('Update vehicle request:', { id, body })
      
      // Convert field names - Supabase uses camelCase matching Prisma schema
      const updateData: any = {}
      const fieldMap: { [key: string]: string } = {
        year: 'year',
        mileage: 'mileage',
        price: 'price',
        purchaseCost: 'purchaseCost',
        shippingCost: 'shippingCost',
        customsCost: 'customsCost',
        maintenanceCost: 'maintenanceCost',
        otherCosts: 'otherCosts',
        soldPrice: 'soldPrice',
        fuelType: 'fuelType',
        engineCapacity: 'engineCapacity',
        exteriorColor: 'exteriorColor',
        interiorColor: 'interiorColor',
        bodyType: 'bodyType',
        numberOfOwners: 'numberOfOwners',
        regionalSpecs: 'regionalSpecs',
        specialPackages: 'specialPackages',
        techFeatures: 'techFeatures',
      }

      for (const [key, value] of Object.entries(body)) {
        const dbField = fieldMap[key] || key
        if (value !== undefined) {
          if (['year', 'mileage'].includes(key)) {
            updateData[dbField] = value ? parseInt(value) : null
          } else if (['price', 'purchaseCost', 'shippingCost', 'customsCost', 'maintenanceCost', 'otherCosts', 'soldPrice'].includes(key)) {
            updateData[dbField] = value ? parseFloat(value) : null
          } else if (['images', 'videos', 'specialPackages', 'techFeatures'].includes(key)) {
            updateData[dbField] = Array.isArray(value) ? JSON.stringify(value) : (value || null)
          } else {
            updateData[dbField] = value
          }
        }
      }

      console.log('Update data for Supabase:', updateData)

      const { data: vehicle, error } = await supabase
        .from('Vehicle')
        .update(updateData)
        .eq('id', parseInt(id))
        .select()
        .single()

      if (error) {
        console.error('Supabase update error:', error)
        return new Response(JSON.stringify({ error: 'Failed to update vehicle', details: error.message }), {
          status: 500,
          headers,
        })
      }

      return new Response(JSON.stringify(parseVehicle(vehicle)), { headers })
    }

    // DELETE /inventory/:id - Delete vehicle (Admin only)
    if (path.match(/^\/\d+$/) && req.method === 'DELETE') {
      const auth = await authenticateToken(req)
      if (auth.error) {
        return new Response(JSON.stringify({ error: auth.error }), {
          status: auth.error === 'Access denied, token missing' ? 401 : 403,
          headers,
        })
      }

      const id = path.slice(1)
      
      const { error } = await supabase
        .from('Vehicle')
        .delete()
        .eq('id', parseInt(id))

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to delete vehicle' }), {
          status: 500,
          headers,
        })
      }

      return new Response(JSON.stringify({ message: 'Vehicle deleted successfully' }), { headers })
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers,
    })
  } catch (error) {
    console.error('Inventory error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers,
    })
  }
})
