import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour la base de données (à compléter en Session 2)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          plan: 'free' | 'pro'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          plan?: 'free' | 'pro'
        }
        Update: {
          name?: string | null
          plan?: 'free' | 'pro'
        }
      }
    }
  }
}
