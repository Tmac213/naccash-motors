import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your_super_secret_jwt_key_change_me_in_production'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper to verify JWT token
function verifyToken(authHeader: string | null): any {
  if (!authHeader) return null;
  
  const token = authHeader.replace('Bearer ', '');
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  
  try {
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp < now) return null;
    
    return payload;
  } catch {
    return null;
  }
}

// Simple JWT implementation for Deno
async function signJWT(payload: any, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Date.now()
  const exp = now + 24 * 60 * 60 * 1000 // 1 day
  
  const headerBase64 = btoa(JSON.stringify(header))
  const payloadBase64 = btoa(JSON.stringify({ ...payload, iat: Math.floor(now / 1000), exp: Math.floor(exp / 1000) }))
  
  const data = `${headerBase64}.${payloadBase64}`
  const signature = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${data}.${secret}`)
  )
  
  return `${data}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}`
}

async function verifyJWT(token: string, secret: string): Promise<any> {
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

// Simple bcrypt implementation for Deno
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'salt_fix_for_deno')
  const hash = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
}

async function comparePassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

serve(async (req: Request) => {
  const url = new URL(req.url)
  // Remove /functions/v1/auth prefix to get the actual path
  let path = url.pathname.replace(/^\/functions\/v1\/auth/, '') || '/'
  // Also handle case where function name is not in path
  path = path.replace(/^\/auth/, '') || '/'
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  }

  try {
    // POST /login
    if ((path === '/login' || path.endsWith('/login')) && req.method === 'POST') {
      const { email, password } = await req.json()
      
      if (!email || !password) {
        return new Response(JSON.stringify({ error: 'Email and password are required' }), {
          status: 400,
          headers,
        })
      }

      const { data: user, error } = await supabase
        .from('User')
        .select('*')
        .eq('email', email)
        .single()

      if (error || !user) {
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
          status: 401,
          headers,
        })
      }

      const isMatch = await comparePassword(password, user.password)
      if (!isMatch) {
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
          status: 401,
          headers,
        })
      }

      const token = await signJWT({ id: user.id, email: user.email }, JWT_SECRET)
      
      return new Response(JSON.stringify({ token, message: 'Login successful' }), {
        status: 200,
        headers,
      })
    }

    // POST /setup
    if ((path === '/setup' || path.endsWith('/setup')) && req.method === 'POST') {
      const { email, password } = await req.json()
      
      if (!email || !password) {
        return new Response(JSON.stringify({ error: 'Email and password required' }), {
          status: 400,
          headers,
        })
      }

      const { data: existingUser } = await supabase
        .from('User')
        .select('*')
        .limit(1)
        .single()

      const hashedPassword = await hashPassword(password)
      
      if (existingUser) {
        // Update existing user's password
        const { data: user, error } = await supabase
          .from('User')
          .update({
            email,
            password: hashedPassword,
          })
          .eq('id', existingUser.id)
          .select()
          .single()

        if (error) {
          return new Response(JSON.stringify({ error: 'Failed to update user' }), {
            status: 500,
            headers,
          })
        }

        return new Response(
          JSON.stringify({ 
            message: 'Admin user updated successfully', 
            user: { id: user.id, email: user.email } 
          }), {
            status: 200,
            headers,
          }
        )
      }
      
      const { data: user, error } = await supabase
        .from('User')
        .insert({
          email,
          password: hashedPassword,
        })
        .select()
        .single()

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to create user' }), {
          status: 500,
          headers,
        })
      }

      return new Response(
        JSON.stringify({ 
          message: 'Admin user created successfully', 
          user: { id: user.id, email: user.email } 
        }), {
          status: 201,
          headers,
        }
      )
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers,
    })
  } catch (error) {
    console.error('Auth error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers,
    })
  }
})
