import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { DEMO_ADMIN_USER, DEMO_REGULAR_USER } from '@/lib/supabase/mock-store';
import { UserProfile, UserRole } from '@/types';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  isDisabled: boolean;
}

/**
 * Resolves the authenticated user on the server side.
 * Validates Supabase session and checks if account is disabled.
 */
export async function getAuthenticatedUser(request?: Request): Promise<AuthenticatedUser | null> {
  const isConfigured = isSupabaseConfigured();

  if (isConfigured) {
    try {
      const supabase = createServerSupabase();
      if (supabase) {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (!authError && authUser) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (!profileError && profile) {
            if (profile.is_disabled) {
              return null; // Deactivated accounts cannot perform actions
            }

            return {
              id: profile.id,
              email: profile.email,
              role: (profile.role as UserRole) || 'user',
              fullName: profile.full_name || profile.email.split('@')[0],
              isDisabled: profile.is_disabled,
            };
          }
        }
      }
    } catch (err) {
      console.warn('Server auth resolution error with Supabase:', err);
    }
  }

  // Local / Demo Mode Session Resolution
  if (request) {
    const demoUserId = request.headers.get('x-demo-user-id');
    if (demoUserId) {
      if (demoUserId.includes('regular') || demoUserId.includes('002')) {
        return {
          id: DEMO_REGULAR_USER.id,
          email: DEMO_REGULAR_USER.email,
          role: DEMO_REGULAR_USER.role,
          fullName: DEMO_REGULAR_USER.full_name || 'Sarah Connor',
          isDisabled: false,
        };
      }
    }
  }

  // Default demo user for local test environment
  return {
    id: DEMO_ADMIN_USER.id,
    email: DEMO_ADMIN_USER.email,
    role: DEMO_ADMIN_USER.role,
    fullName: DEMO_ADMIN_USER.full_name || 'Alex Vance (Admin)',
    isDisabled: false,
  };
}

/**
 * Requires an authenticated administrator user.
 */
export async function requireAdmin(request?: Request): Promise<AuthenticatedUser | null> {
  const user = await getAuthenticatedUser(request);
  if (!user || user.role !== 'admin' || user.isDisabled) {
    return null;
  }
  return user;
}
