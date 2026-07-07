// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verify } from 'https://deno.land/x/djwt@v3.0.2/mod.ts';

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
const ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/quicktime', 'video/avi', 'video/x-matroska', 'video/webm', 'video/x-msvideo'];

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

// Parse multipart form data in Deno
async function parseMultipartFormData(req: Request): Promise<{ files: Array<{ name: string; filename: string; contentType: string; data: Uint8Array }> }> {
  const formData = await req.formData();
  const files: Array<{ name: string; filename: string; contentType: string; data: Uint8Array }> = [];

  for (const [name, value] of formData.entries()) {
    if (value instanceof File) {
      const arrayBuffer = await value.arrayBuffer();
      files.push({
        name,
        filename: value.name,
        contentType: value.type,
        data: new Uint8Array(arrayBuffer),
      });
    }
  }

  return { files };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Verify authentication
  const authResult = await verifyToken(req.headers.get('authorization'));
  if (!authResult.valid) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { files } = await parseMultipartFormData(req);

    if (!files || files.length === 0) {
      return new Response(JSON.stringify({ error: 'No files uploaded' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate file types and sizes
    for (const file of files) {
      const allowed = [...ALLOWED_IMAGE_MIMES, ...ALLOWED_VIDEO_MIMES];
      if (!allowed.includes(file.contentType)) {
        return new Response(JSON.stringify({ 
          error: `Unsupported file type: ${file.contentType}. Allowed: images (jpg, png, webp, heic) and videos (mp4, mov, avi, mkv, webm).` 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (file.data.length > 200 * 1024 * 1024) {
        return new Response(JSON.stringify({ error: 'File too large. Maximum size is 200MB per file.' }), {
          status: 413,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Upload files to Supabase Storage
    const uploadPromises = files.map(async (file) => {
      const isVideo = file.contentType.startsWith('video/');
      const folder = isVideo ? 'vehicles/videos' : 'vehicles/images';
      const fileExt = file.filename.split('.').pop() || 'bin';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('vehicles')
        .upload(filePath, file.data, {
          contentType: file.contentType,
          upsert: false,
        });

      if (error) {
        throw new Error(`Failed to upload ${file.filename}: ${error.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('vehicles')
        .getPublicUrl(filePath);

      return {
        url: publicUrl,
        type: isVideo ? 'video' : 'image',
        originalName: file.filename,
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    return new Response(JSON.stringify({ files: uploadedFiles }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to upload files to Supabase' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
