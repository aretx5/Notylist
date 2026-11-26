import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // Extract OAuth provider info
      const provider = data.user.app_metadata.provider || 'google';
      const oauthId = data.user.id;
      const email = data.user.email;
      const avatarUrl = data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture;
      
      // Generate username from OAuth data
      let username = data.user.user_metadata?.full_name || 
                     data.user.user_metadata?.name || 
                     data.user.user_metadata?.username;
      
      // Fallback to email prefix if no name available
      if (!username && email) {
        username = email.split('@')[0];
      }
      
      // Check if user exists by oauth_provider and oauth_id
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('oauth_provider', provider)
        .eq('oauth_id', oauthId)
        .single();

      if (!existingProfile) {
        // Create new user with OAuth data
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: email,
            username: username,
            oauth_provider: provider,
            oauth_id: oauthId,
            avatar_url: avatarUrl,
          });
          
        if (insertError) {
          console.error('Failed to create user:', insertError);
        }
      }
      
      // Redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', origin));
    }
  }

  // If error or no code, redirect to login
  return NextResponse.redirect(new URL('/login', origin));
}