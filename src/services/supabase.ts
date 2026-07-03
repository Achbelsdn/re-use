import { createClient } from '@supabase/supabase-js';

// Client public (pour le frontend - lecture seule via les Row Level Security policies)
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Client Admin (pour les API Routes côté serveur uniquement - contourne les RLS)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://missing-url',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'missing-key'
);
