export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      cms_assets: {
        Row: {
          category: string | null;
          created_at: string;
          file_name: string | null;
          id: string;
          is_active: boolean;
          is_published: boolean;
          mime_type: string | null;
          storage_path: string;
          title: string;
          updated_at: string;
          uploaded_by: string | null;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          file_name?: string | null;
          id?: string;
          is_active?: boolean;
          is_published?: boolean;
          mime_type?: string | null;
          storage_path: string;
          title: string;
          updated_at?: string;
          uploaded_by?: string | null;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          file_name?: string | null;
          id?: string;
          is_active?: boolean;
          is_published?: boolean;
          mime_type?: string | null;
          storage_path?: string;
          title?: string;
          updated_at?: string;
          uploaded_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "cms_assets_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      announcements: {
        Row: {
          author_id: string | null;
          body: string;
          created_at: string;
          id: string;
          is_active: boolean;
          is_published: boolean;
          published_at: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          author_id?: string | null;
          body: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          is_published?: boolean;
          published_at?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string | null;
          body?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          is_published?: boolean;
          published_at?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "announcements_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          product_id: string;
          purchase_order_id: string;
          quantity: number;
          unit_price: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          product_id: string;
          purchase_order_id: string;
          quantity: number;
          unit_price: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          product_id?: string;
          purchase_order_id?: string;
          quantity?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_purchase_order_id_fkey";
            columns: ["purchase_order_id"];
            isOneToOne: false;
            referencedRelation: "purchase_orders";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          created_at: string;
          dealer_price: number;
          description: string | null;
          id: string;
          is_active: boolean;
          name: string;
          sku: string;
          stock_quantity: number;
          supplier_cost: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          dealer_price?: number;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          sku: string;
          stock_quantity?: number;
          supplier_cost?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          dealer_price?: number;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          sku?: string;
          stock_quantity?: number;
          supplier_cost?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          company_name: string | null;
          contact_email: string | null;
          contact_name: string | null;
          contact_phone: string | null;
          created_at: string;
          id: string;
          is_active: boolean;
          role: Database["public"]["Enums"]["user_role"];
          updated_at: string;
        };
        Insert: {
          company_name?: string | null;
          contact_email?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          id: string;
          is_active?: boolean;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Update: {
          company_name?: string | null;
          contact_email?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
      purchase_orders: {
        Row: {
          created_at: string;
          dealer_id: string;
          id: string;
          notes: string | null;
          order_number: string;
          status: Database["public"]["Enums"]["purchase_order_status"];
          total_amount: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          dealer_id: string;
          id?: string;
          notes?: string | null;
          order_number: string;
          status?: Database["public"]["Enums"]["purchase_order_status"];
          total_amount?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          dealer_id?: string;
          id?: string;
          notes?: string | null;
          order_number?: string;
          status?: Database["public"]["Enums"]["purchase_order_status"];
          total_amount?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "purchase_orders_dealer_id_fkey";
            columns: ["dealer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      products_dealer_catalog: {
        Row: {
          created_at: string | null;
          dealer_price: number | null;
          description: string | null;
          id: string | null;
          name: string | null;
          sku: string | null;
          stock_quantity: number | null;
          updated_at: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_dealer: { Args: Record<PropertyKey, never>; Returns: boolean };
      is_employee: { Args: Record<PropertyKey, never>; Returns: boolean };
    };
    Enums: {
      purchase_order_status:
        | "pending"
        | "processing"
        | "dispatched"
        | "completed"
        | "cancelled";
      user_role: "dealer" | "employee";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database;
}
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database;
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof Database;
}
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type UserRole = Enums<"user_role">;
export type PurchaseOrderStatus = Enums<"purchase_order_status">;

export type Profile = Tables<"profiles">;
export type Product = Tables<"products">;
export type PurchaseOrder = Tables<"purchase_orders">;
export type OrderItem = Tables<"order_items">;
export type CmsAsset = Tables<"cms_assets">;
export type Announcement = Tables<"announcements">;
export type DealerProduct = Tables<"products_dealer_catalog">;
