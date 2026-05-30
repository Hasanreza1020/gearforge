import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Supabase uses 'next', our login form passes 'redirect'
  const next = searchParams.get('next') ?? searchParams.get('redirect') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('[auth/callback]', error.message)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }
  }

  // Ensure the redirect is a relative path (security: no open redirect)
  const redirectTo = next.startsWith('/') ? next : '/'
  return NextResponse.redirect(`${origin}${redirectTo}`)
}
