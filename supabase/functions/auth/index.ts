// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sign } from 'https://deno.land/x/djwt@v3.0.2/mod.ts';
import { hash, compare } from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

// JWT Secret for token generation
const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'p4l2IQdbq7ZAq5oGyicEzpz2JCXEOpj9';

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

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  // POST /auth/login - Admin Login
  if (path === '/auth/login') {
    try {
      const { email, password } = await req.json();

      if (!email || !password) {
        return new Response(JSON.stringify({ error: 'Email and password are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Get user from Supabase auth.users table
      const { data: { users }, error } = await supabase.auth.admin.listUsers();
      
      if (error) throw error;

      const user = users.find(u => u.email === email);

      if (!user) {
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // For simplicity, we'll use Supabase's built-in auth
      // In production, you might want to use a custom users table
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Generate custom JWT token
      const token = await sign(
        { id: data.user.id, email: data.user.email },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      return new Response(JSON.stringify({ token, message: 'Login successful' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (error: any) {
      console.error('Login error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // POST /auth/setup - Setup initial admin user
  if (path === '/auth/setup') {
    try {
      const { email, password } = await req.json();

      if (!email || !password) {
        return new Response(JSON.stringify({ error: 'Email and password required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Check if any users exist
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) throw listError;

      if (users.length > 0) {
        return new Response(JSON.stringify({ error: 'Admin user already setup' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Create user in Supabase Auth
      const { data, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (createError) throw createError;

      return new Response(JSON.stringify({ 
        message: 'Admin user created successfully', 
        user: { id: data.user.id, email: data.user.email } 
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (error: any) {
      console.error('Setup error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
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
