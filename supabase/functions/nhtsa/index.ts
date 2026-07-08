import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const NHTSA_BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles'

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
  // Remove /functions/v1/nhtsa prefix to get the actual path
  let path = url.pathname.replace(/^\/functions\/v1\/nhtsa/, '') || '/'
  // Also handle case where function name is not in path
  path = path.replace(/^\/nhtsa/, '') || '/'
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  }

  try {
    // GET /nhtsa/makes - Get all car makes (Admin only)
    if ((path === '/makes' || path.endsWith('/makes')) && req.method === 'GET') {
      const auth = await authenticateToken(req)
      if (auth.error) {
        return new Response(JSON.stringify({ error: auth.error }), {
          status: auth.error === 'Access denied, token missing' ? 401 : 403,
          headers,
        })
      }

      const response = await fetch(`${NHTSA_BASE_URL}/GetAllMakes?format=json`)
      const data = await response.json()
      
      return new Response(JSON.stringify(data), { headers })
    }

    // GET /nhtsa/models/:make/:year - Get models by make and year (Admin only)
    const modelsMatch = path.match(/^\/models\/([^\/]+)\/(\d+)$/)
    if (modelsMatch && req.method === 'GET') {
      const auth = await authenticateToken(req)
      if (auth.error) {
        return new Response(JSON.stringify({ error: auth.error }), {
          status: auth.error === 'Access denied, token missing' ? 401 : 403,
          headers,
        })
      }

      const [, make, year] = modelsMatch
      
      const response = await fetch(`${NHTSA_BASE_URL}/GetModelsForMakeYear/make/${make}/modelyear/${year}?format=json`)
      const data = await response.json()
      
      return new Response(JSON.stringify(data), { headers })
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers,
    })
  } catch (error) {
    console.error('NHTSA error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers,
    })
  }
})
