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
  // Remove /functions/v1/settings prefix to get the actual path
  let path = url.pathname.replace(/^\/functions\/v1\/settings/, '') || '/'
  // Also handle case where function name is not in path
  path = path.replace(/^\/settings/, '') || '/'
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  }

  try {
    // GET /settings - Get settings (Public)
    if ((path === '/' || path === '' || path.endsWith('/') || path.endsWith('/settings')) && req.method === 'GET') {
      let { data: settings, error } = await supabase
        .from('Settings')
        .select('*')
        .eq('id', 1)
        .single()

      if (error || !settings) {
        // Create default settings if not exists
        const { data: newSettings, error: createError } = await supabase
          .from('Settings')
          .insert({
            id: 1,
            whatsappNumber: '',
            instagramUrl: '',
            tiktokUrl: '',
            facebookUrl: ''
          })
          .select()
          .single()

        if (createError) {
          return new Response(JSON.stringify({ error: 'Failed to fetch settings' }), {
            status: 500,
            headers,
          })
        }

        settings = newSettings
      }

      return new Response(JSON.stringify(settings), { headers })
    }

    // PUT /settings - Update settings (Admin only)
    if ((path === '/' || path === '' || path.endsWith('/') || path.endsWith('/settings')) && req.method === 'PUT') {
      const auth = await authenticateToken(req)
      if (auth.error) {
        return new Response(JSON.stringify({ error: auth.error }), {
          status: auth.error === 'Access denied, token missing' ? 401 : 403,
          headers,
        })
      }

      const body = await req.json()
      const {
        whatsappNumber, instagramUrl, tiktokUrl, facebookUrl, 
        email, phoneNumber, address, aboutUsText
      } = body

      const { data: settings, error } = await supabase
        .from('Settings')
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
        .single()

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to update settings' }), {
          status: 500,
          headers,
        })
      }

      return new Response(JSON.stringify(settings), { headers })
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers,
    })
  } catch (error) {
    console.error('Settings error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers,
    })
  }
})
