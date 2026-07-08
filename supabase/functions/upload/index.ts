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
  // Remove /functions/v1/upload prefix to get the actual path
  let path = url.pathname.replace(/^\/functions\/v1\/upload/, '') || '/'
  // Also handle case where function name is not in path
  path = path.replace(/^\/upload/, '') || '/'
  
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
    // POST /upload - Upload files (Admin only)
    if ((path === '/' || path.endsWith('/')) && req.method === 'POST') {
      const auth = await authenticateToken(req)
      if (auth.error) {
        return new Response(JSON.stringify({ error: auth.error }), {
          status: auth.error === 'Access denied, token missing' ? 401 : 403,
          headers,
        })
      }

      const formData = await req.formData()
      const files = formData.getAll('media') as File[]
      
      if (!files || files.length === 0) {
        return new Response(JSON.stringify({ error: 'No files uploaded' }), {
          status: 400,
          headers,
        })
      }

      const CLOUDINARY_CLOUD_NAME = Deno.env.get('CLOUDINARY_CLOUD_NAME')
      const CLOUDINARY_API_KEY = Deno.env.get('CLOUDINARY_API_KEY')
      const CLOUDINARY_API_SECRET = Deno.env.get('CLOUDINARY_API_SECRET')
      const useCloudinary = !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET)
      
      console.log('Upload config:', { useCloudinary, hasCloudName: !!CLOUDINARY_CLOUD_NAME, hasApiKey: !!CLOUDINARY_API_KEY, hasSecret: !!CLOUDINARY_API_SECRET })

      const urls = []

      for (const file of files) {
        const isVideo = file.type.startsWith('video/')
        let finalUrl = ''

        if (useCloudinary) {
          try {
            // Upload to Cloudinary
            const formData = new FormData()
            formData.append('file', file)
            formData.append('upload_preset', 'ml_default') // You may need to configure this in Cloudinary
            formData.append('folder', 'car-dealer-uploads')
            
            const resourceType = isVideo ? 'video' : 'image'
            const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`
            
            const response = await fetch(cloudinaryUrl, {
              method: 'POST',
              body: formData,
            })
            
            const result = await response.json()
            
            if (result.error) {
              throw new Error(result.error.message)
            }
            
            finalUrl = result.secure_url
          } catch (error: any) {
            console.error('Cloudinary upload error:', error)
            return new Response(JSON.stringify({ error: `Cloudinary error: ${error.message}` }), {
              status: 400,
              headers,
            })
          }
        } else {
          // Store in Supabase Storage as fallback
          try {
            const fileName = `vehicle-${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`
            console.log('Uploading to Supabase storage:', fileName)
            
            const { data, error } = await supabase.storage
              .from('vehicle-uploads')
              .upload(fileName, file)
            
            if (error) {
              throw error
            }
            
            const { data: { publicUrl } } = supabase.storage
              .from('vehicle-uploads')
              .getPublicUrl(fileName)
            
            console.log('Supabase public URL:', publicUrl)
            finalUrl = publicUrl
          } catch (error: any) {
            console.error('Supabase storage error:', error)
            return new Response(JSON.stringify({ error: `Storage error: ${error.message}` }), {
              status: 400,
              headers,
            })
          }
        }

        console.log('Final URL for file:', finalUrl)
        urls.push({
          url: finalUrl,
          type: isVideo ? 'video' : 'image',
          originalName: file.name,
        })
      }

      return new Response(JSON.stringify({ files: urls }), { headers })
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers,
    })
  }
})
