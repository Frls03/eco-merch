import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Copia .env.example a .env y completa los valores de tu proyecto de Supabase.',
  );
}

// Nota: no se pasa el generic `Database` a createClient a propósito. Las
// definiciones de tabla generadas a mano en `database.types.ts` no calzan
// 1:1 con el shape que espera supabase-js (Relationships, Views, Enums...),
// así que tipamos manualmente los resultados de cada query en los hooks/
// páginas usando las interfaces de `database.types.ts`.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
