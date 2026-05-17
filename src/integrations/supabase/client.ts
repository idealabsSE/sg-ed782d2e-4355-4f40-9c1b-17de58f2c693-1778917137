import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      storageKey: 'sb-auth-token',
      storage: {
        getItem: (key: string) => {
          if (typeof window === 'undefined') return null;
          return document.cookie
            .split('; ')
            .find(row => row.startsWith(`${key}=`))
            ?.split('=')[1] || null;
        },
        setItem: (key: string, value: string) => {
          if (typeof window === 'undefined') return;
          document.cookie = `${key}=${value}; path=/; max-age=31536000; SameSite=Lax`;
        },
        removeItem: (key: string) => {
          if (typeof window === 'undefined') return;
          document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
      },
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);