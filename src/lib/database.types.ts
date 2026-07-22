// Tipos generados a mano a partir de supabase/migrations/0001_init.sql.
// Si prefieres tipos 100% sincronizados, genera con:
//   npx supabase gen types typescript --project-id <tu-project-id> > src/lib/database.types.ts

export type UserRole = 'admin' | 'vendedor';
export type ProductType = 'hoodie' | 'totbag';
export type VariantAttribute = 'talla' | 'color';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Variant {
  id: string;
  product_id: string;
  attribute_type: VariantAttribute;
  attribute_value: string;
  stock_initial: number;
  stock_current: number;
  updated_at: string;
  updated_by: string | null;
}

export interface StockMovement {
  id: string;
  variant_id: string;
  change: number;
  reason: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      products: { Row: Product; Insert: Partial<Product>; Update: Partial<Product> };
      variants: { Row: Variant; Insert: Partial<Variant>; Update: Partial<Variant> };
      stock_movements: {
        Row: StockMovement;
        Insert: Partial<StockMovement>;
        Update: Partial<StockMovement>;
      };
    };
    Functions: {
      adjust_stock: {
        Args: { p_variant_id: string; p_delta: number; p_reason?: string | null };
        Returns: Variant;
      };
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
  };
}
