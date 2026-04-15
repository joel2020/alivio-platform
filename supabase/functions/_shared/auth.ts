import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export async function requireAuth(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) throw new Response('Unauthorized', { status: 401 })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  )

  const { data: { user }, error } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  )

  if (error || !user) throw new Response('Unauthorized', { status: 401 })
  return user
}
