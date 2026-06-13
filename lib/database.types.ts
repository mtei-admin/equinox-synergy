export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          id: string
          is_active: boolean
          is_published: boolean
          published_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_published?: boolean
          published_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_published?: boolean
          published_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_assets: {
        Row: {
          category: string | null
          created_at: string
          file_name: string | null
          id: string
          is_active: boolean
          is_published: boolean
          mime_type: string | null
          storage_path: string
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          file_name?: string | null
          id?: string
          is_active?: boolean
          is_published?: boolean
          mime_type?: string | null
          storage_path: string
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          file_name?: string | null
          id?: string
          is_active?: boolean
          is_published?: boolean
          mime_type?: string | null
          storage_path?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cms_assets_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_receipts: {
        Row: {
          authorized_at: string | null
          authorized_by: string | null
          created_at: string
          dr_number: string
          id: string
          notes: string | null
          purchase_order_id: string
          status: Database["public"]["Enums"]["delivery_receipt_status"]
          updated_at: string
        }
        Insert: {
          authorized_at?: string | null
          authorized_by?: string | null
          created_at?: string
          dr_number: string
          id?: string
          notes?: string | null
          purchase_order_id: string
          status?: Database["public"]["Enums"]["delivery_receipt_status"]
          updated_at?: string
        }
        Update: {
          authorized_at?: string | null
          authorized_by?: string | null
          created_at?: string
          dr_number?: string
          id?: string
          notes?: string | null
          purchase_order_id?: string
          status?: Database["public"]["Enums"]["delivery_receipt_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_receipts_authorized_by_fkey"
            columns: ["authorized_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_receipts_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_receipt_lines: {
        Row: {
          condition: Database["public"]["Enums"]["receipt_line_condition"]
          created_at: string
          goods_receipt_id: string
          id: string
          notes: string | null
          product_id: string
          quantity_accepted: number
          quantity_received: number
          quantity_rejected: number
          supplier_order_line_id: string | null
        }
        Insert: {
          condition?: Database["public"]["Enums"]["receipt_line_condition"]
          created_at?: string
          goods_receipt_id: string
          id?: string
          notes?: string | null
          product_id: string
          quantity_accepted?: number
          quantity_received: number
          quantity_rejected?: number
          supplier_order_line_id?: string | null
        }
        Update: {
          condition?: Database["public"]["Enums"]["receipt_line_condition"]
          created_at?: string
          goods_receipt_id?: string
          id?: string
          notes?: string | null
          product_id?: string
          quantity_accepted?: number
          quantity_received?: number
          quantity_rejected?: number
          supplier_order_line_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goods_receipt_lines_goods_receipt_id_fkey"
            columns: ["goods_receipt_id"]
            isOneToOne: false
            referencedRelation: "goods_receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipt_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipt_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_dealer_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipt_lines_supplier_order_line_id_fkey"
            columns: ["supplier_order_line_id"]
            isOneToOne: false
            referencedRelation: "supplier_order_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_receipts: {
        Row: {
          created_at: string
          id: string
          inbound_shipment_id: string | null
          notes: string | null
          posted_at: string | null
          receipt_number: string
          received_at: string | null
          received_by: string | null
          status: Database["public"]["Enums"]["goods_receipt_status"]
          supplier_purchase_order_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          inbound_shipment_id?: string | null
          notes?: string | null
          posted_at?: string | null
          receipt_number: string
          received_at?: string | null
          received_by?: string | null
          status?: Database["public"]["Enums"]["goods_receipt_status"]
          supplier_purchase_order_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          inbound_shipment_id?: string | null
          notes?: string | null
          posted_at?: string | null
          receipt_number?: string
          received_at?: string | null
          received_by?: string | null
          status?: Database["public"]["Enums"]["goods_receipt_status"]
          supplier_purchase_order_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goods_receipts_inbound_shipment_id_fkey"
            columns: ["inbound_shipment_id"]
            isOneToOne: false
            referencedRelation: "inbound_shipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipts_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipts_supplier_purchase_order_id_fkey"
            columns: ["supplier_purchase_order_id"]
            isOneToOne: false
            referencedRelation: "supplier_purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      inbound_shipments: {
        Row: {
          arrived_at: string | null
          carrier: string | null
          created_at: string
          expected_arrival_at: string | null
          id: string
          notes: string | null
          shipped_at: string | null
          status: Database["public"]["Enums"]["inbound_shipment_status"]
          supplier_purchase_order_id: string
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          arrived_at?: string | null
          carrier?: string | null
          created_at?: string
          expected_arrival_at?: string | null
          id?: string
          notes?: string | null
          shipped_at?: string | null
          status?: Database["public"]["Enums"]["inbound_shipment_status"]
          supplier_purchase_order_id: string
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          arrived_at?: string | null
          carrier?: string | null
          created_at?: string
          expected_arrival_at?: string | null
          id?: string
          notes?: string | null
          shipped_at?: string | null
          status?: Database["public"]["Enums"]["inbound_shipment_status"]
          supplier_purchase_order_id?: string
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inbound_shipments_supplier_purchase_order_id_fkey"
            columns: ["supplier_purchase_order_id"]
            isOneToOne: false
            referencedRelation: "supplier_purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          inventory_unit_id: string | null
          notes: string | null
          product_id: string
          quantity_delta: number
          reference_id: string | null
          reference_type:
            | Database["public"]["Enums"]["inventory_reference_type"]
            | null
          txn_type: Database["public"]["Enums"]["inventory_txn_type"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          inventory_unit_id?: string | null
          notes?: string | null
          product_id: string
          quantity_delta: number
          reference_id?: string | null
          reference_type?:
            | Database["public"]["Enums"]["inventory_reference_type"]
            | null
          txn_type: Database["public"]["Enums"]["inventory_txn_type"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          inventory_unit_id?: string | null
          notes?: string | null
          product_id?: string
          quantity_delta?: number
          reference_id?: string | null
          reference_type?:
            | Database["public"]["Enums"]["inventory_reference_type"]
            | null
          txn_type?: Database["public"]["Enums"]["inventory_txn_type"]
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_dealer_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_unit_fkey"
            columns: ["inventory_unit_id"]
            isOneToOne: false
            referencedRelation: "inventory_units"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_units: {
        Row: {
          created_at: string
          goods_receipt_line_id: string | null
          id: string
          model: string | null
          order_item_id: string | null
          product_id: string
          serial_number: string
          status: Database["public"]["Enums"]["inventory_unit_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          goods_receipt_line_id?: string | null
          id?: string
          model?: string | null
          order_item_id?: string | null
          product_id: string
          serial_number: string
          status?: Database["public"]["Enums"]["inventory_unit_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          goods_receipt_line_id?: string | null
          id?: string
          model?: string | null
          order_item_id?: string | null
          product_id?: string
          serial_number?: string
          status?: Database["public"]["Enums"]["inventory_unit_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_units_goods_receipt_line_id_fkey"
            columns: ["goods_receipt_line_id"]
            isOneToOne: false
            referencedRelation: "goods_receipt_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_units_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_units_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_units_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_dealer_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          purchase_order_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          purchase_order_id: string
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          purchase_order_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_dealer_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      outbound_shipments: {
        Row: {
          created_at: string
          delivered_at: string | null
          delivery_receipt_id: string
          dispatched_at: string | null
          driver_phone: string | null
          id: string
          notes: string | null
          route_notes: string | null
          status: Database["public"]["Enums"]["outbound_shipment_status"]
          trucker_name: string | null
          updated_at: string
          vehicle_plate: string | null
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          delivery_receipt_id: string
          dispatched_at?: string | null
          driver_phone?: string | null
          id?: string
          notes?: string | null
          route_notes?: string | null
          status?: Database["public"]["Enums"]["outbound_shipment_status"]
          trucker_name?: string | null
          updated_at?: string
          vehicle_plate?: string | null
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          delivery_receipt_id?: string
          dispatched_at?: string | null
          driver_phone?: string | null
          id?: string
          notes?: string | null
          route_notes?: string | null
          status?: Database["public"]["Enums"]["outbound_shipment_status"]
          trucker_name?: string | null
          updated_at?: string
          vehicle_plate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outbound_shipments_delivery_receipt_id_fkey"
            columns: ["delivery_receipt_id"]
            isOneToOne: false
            referencedRelation: "delivery_receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      pick_list_lines: {
        Row: {
          created_at: string
          id: string
          inventory_unit_id: string | null
          order_item_id: string
          pick_list_id: string
          product_id: string
          quantity_picked: number
          quantity_requested: number
        }
        Insert: {
          created_at?: string
          id?: string
          inventory_unit_id?: string | null
          order_item_id: string
          pick_list_id: string
          product_id: string
          quantity_picked?: number
          quantity_requested: number
        }
        Update: {
          created_at?: string
          id?: string
          inventory_unit_id?: string | null
          order_item_id?: string
          pick_list_id?: string
          product_id?: string
          quantity_picked?: number
          quantity_requested?: number
        }
        Relationships: [
          {
            foreignKeyName: "pick_list_lines_inventory_unit_id_fkey"
            columns: ["inventory_unit_id"]
            isOneToOne: false
            referencedRelation: "inventory_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pick_list_lines_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pick_list_lines_pick_list_id_fkey"
            columns: ["pick_list_id"]
            isOneToOne: false
            referencedRelation: "pick_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pick_list_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pick_list_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_dealer_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      pick_lists: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          delivery_receipt_id: string
          id: string
          notes: string | null
          posted_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["pick_list_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          delivery_receipt_id: string
          id?: string
          notes?: string | null
          posted_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["pick_list_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          delivery_receipt_id?: string
          id?: string
          notes?: string | null
          posted_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["pick_list_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pick_lists_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pick_lists_delivery_receipt_id_fkey"
            columns: ["delivery_receipt_id"]
            isOneToOne: false
            referencedRelation: "delivery_receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          dealer_price: number
          description: string | null
          id: string
          is_active: boolean
          model: string | null
          name: string
          serial_number: string | null
          sku: string
          stock_quantity: number
          supplier_cost: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          dealer_price?: number
          description?: string | null
          id?: string
          is_active?: boolean
          model?: string | null
          name: string
          serial_number?: string | null
          sku: string
          stock_quantity?: number
          supplier_cost?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          dealer_price?: number
          description?: string | null
          id?: string
          is_active?: boolean
          model?: string | null
          name?: string
          serial_number?: string | null
          sku?: string
          stock_quantity?: number
          supplier_cost?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      proof_of_deliveries: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          outbound_shipment_id: string
          recorded_by: string | null
          signature_storage_path: string | null
          signed_at: string
          signed_by: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          outbound_shipment_id: string
          recorded_by?: string | null
          signature_storage_path?: string | null
          signed_at?: string
          signed_by: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          outbound_shipment_id?: string
          recorded_by?: string | null
          signature_storage_path?: string | null
          signed_at?: string
          signed_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "proof_of_deliveries_outbound_shipment_id_fkey"
            columns: ["outbound_shipment_id"]
            isOneToOne: false
            referencedRelation: "outbound_shipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proof_of_deliveries_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          dealer_id: string
          id: string
          notes: string | null
          order_number: string
          status: Database["public"]["Enums"]["purchase_order_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          dealer_id: string
          id?: string
          notes?: string | null
          order_number: string
          status?: Database["public"]["Enums"]["purchase_order_status"]
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          dealer_id?: string
          id?: string
          notes?: string | null
          order_number?: string
          status?: Database["public"]["Enums"]["purchase_order_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_request_lines: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          product_id: string
          purchase_request_id: string
          quantity_requested: number
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          product_id: string
          purchase_request_id: string
          quantity_requested: number
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string
          purchase_request_id?: string
          quantity_requested?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_request_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_request_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_dealer_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_request_lines_purchase_request_id_fkey"
            columns: ["purchase_request_id"]
            isOneToOne: false
            referencedRelation: "purchase_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          notes: string | null
          pr_number: string
          requested_by: string
          status: Database["public"]["Enums"]["purchase_request_status"]
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          pr_number: string
          requested_by: string
          status?: Database["public"]["Enums"]["purchase_request_status"]
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          pr_number?: string
          requested_by?: string
          status?: Database["public"]["Enums"]["purchase_request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      receipt_exceptions: {
        Row: {
          created_at: string
          exception_type: Database["public"]["Enums"]["receipt_exception_type"]
          goods_receipt_line_id: string
          id: string
          notes: string | null
          quantity_affected: number
          resolution_status: Database["public"]["Enums"]["exception_resolution_status"]
          resolved_at: string | null
          resolved_by: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          exception_type: Database["public"]["Enums"]["receipt_exception_type"]
          goods_receipt_line_id: string
          id?: string
          notes?: string | null
          quantity_affected: number
          resolution_status?: Database["public"]["Enums"]["exception_resolution_status"]
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          exception_type?: Database["public"]["Enums"]["receipt_exception_type"]
          goods_receipt_line_id?: string
          id?: string
          notes?: string | null
          quantity_affected?: number
          resolution_status?: Database["public"]["Enums"]["exception_resolution_status"]
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipt_exceptions_goods_receipt_line_id_fkey"
            columns: ["goods_receipt_line_id"]
            isOneToOne: false
            referencedRelation: "goods_receipt_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipt_exceptions_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_invoices: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          due_at: string | null
          id: string
          invoice_number: string
          issued_at: string | null
          notes: string | null
          purchase_order_id: string
          status: Database["public"]["Enums"]["sales_invoice_status"]
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          created_by?: string | null
          due_at?: string | null
          id?: string
          invoice_number: string
          issued_at?: string | null
          notes?: string | null
          purchase_order_id: string
          status?: Database["public"]["Enums"]["sales_invoice_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          due_at?: string | null
          id?: string
          invoice_number?: string
          issued_at?: string | null
          notes?: string | null
          purchase_order_id?: string
          status?: Database["public"]["Enums"]["sales_invoice_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_invoices_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_order_lines: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity_ordered: number
          quantity_received: number
          supplier_purchase_order_id: string
          unit_cost: number
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity_ordered: number
          quantity_received?: number
          supplier_purchase_order_id: string
          unit_cost?: number
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity_ordered?: number
          quantity_received?: number
          supplier_purchase_order_id?: string
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "supplier_order_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_order_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_dealer_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_order_lines_supplier_purchase_order_id_fkey"
            columns: ["supplier_purchase_order_id"]
            isOneToOne: false
            referencedRelation: "supplier_purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_purchase_orders: {
        Row: {
          created_at: string
          created_by: string | null
          expected_at: string | null
          id: string
          notes: string | null
          purchase_request_id: string | null
          spo_number: string
          status: Database["public"]["Enums"]["supplier_order_status"]
          supplier_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expected_at?: string | null
          id?: string
          notes?: string | null
          purchase_request_id?: string | null
          spo_number: string
          status?: Database["public"]["Enums"]["supplier_order_status"]
          supplier_id: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expected_at?: string | null
          id?: string
          notes?: string | null
          purchase_request_id?: string | null
          spo_number?: string
          status?: Database["public"]["Enums"]["supplier_order_status"]
          supplier_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_purchase_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_purchase_orders_purchase_request_id_fkey"
            columns: ["purchase_request_id"]
            isOneToOne: false
            referencedRelation: "purchase_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          code: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          code: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          code?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      products_dealer_catalog: {
        Row: {
          created_at: string | null
          dealer_price: number | null
          description: string | null
          id: string | null
          in_stock: boolean | null
          model: string | null
          name: string | null
          serial_number: string | null
          sku: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dealer_price?: number | null
          description?: string | null
          id?: string | null
          in_stock?: boolean | null
          model?: string | null
          name?: string | null
          serial_number?: string | null
          sku?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dealer_price?: number | null
          description?: string | null
          id?: string | null
          in_stock?: boolean | null
          model?: string | null
          name?: string | null
          serial_number?: string | null
          sku?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_document_number: { Args: { prefix: string }; Returns: string }
      is_dealer: { Args: never; Returns: boolean }
      is_employee: { Args: never; Returns: boolean }
      post_goods_receipt: { Args: { p_receipt_id: string }; Returns: undefined }
      post_pick_list: { Args: { p_pick_list_id: string }; Returns: undefined }
    }
    Enums: {
      delivery_receipt_status:
        | "draft"
        | "authorized"
        | "picking"
        | "picked"
        | "loaded"
        | "dispatched"
        | "delivered"
        | "cancelled"
      exception_resolution_status:
        | "open"
        | "supplier_claim"
        | "return_pending"
        | "replacement_pending"
        | "resolved"
        | "written_off"
      goods_receipt_status:
        | "draft"
        | "validated"
        | "posted"
        | "exception"
        | "cancelled"
      inbound_shipment_status:
        | "scheduled"
        | "in_transit"
        | "arrived"
        | "cancelled"
      inventory_reference_type:
        | "goods_receipt"
        | "supplier_purchase_order"
        | "purchase_order"
        | "delivery_receipt"
        | "pick_list"
        | "manual_adjustment"
        | "receipt_exception"
      inventory_txn_type:
        | "receive"
        | "ship"
        | "reserve"
        | "release"
        | "adjust"
        | "return_in"
        | "return_out"
      inventory_unit_status:
        | "available"
        | "reserved"
        | "picked"
        | "shipped"
        | "quarantined"
        | "scrapped"
      outbound_shipment_status:
        | "scheduled"
        | "loaded"
        | "in_transit"
        | "delivered"
        | "cancelled"
      pick_list_status: "open" | "in_progress" | "completed" | "cancelled"
      purchase_order_status:
        | "pending"
        | "processing"
        | "dispatched"
        | "completed"
        | "cancelled"
      purchase_request_status:
        | "draft"
        | "submitted"
        | "approved"
        | "rejected"
        | "converted"
        | "cancelled"
      receipt_exception_type:
        | "damage"
        | "short_ship"
        | "over_ship"
        | "wrong_item"
        | "quality"
        | "other"
      receipt_line_condition:
        | "ok"
        | "damaged"
        | "short"
        | "wrong_item"
        | "other"
      sales_invoice_status: "draft" | "issued" | "paid" | "void"
      supplier_order_status:
        | "draft"
        | "sent"
        | "partially_received"
        | "received"
        | "cancelled"
      user_role: "dealer" | "employee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      delivery_receipt_status: [
        "draft",
        "authorized",
        "picking",
        "picked",
        "loaded",
        "dispatched",
        "delivered",
        "cancelled",
      ],
      exception_resolution_status: [
        "open",
        "supplier_claim",
        "return_pending",
        "replacement_pending",
        "resolved",
        "written_off",
      ],
      goods_receipt_status: [
        "draft",
        "validated",
        "posted",
        "exception",
        "cancelled",
      ],
      inbound_shipment_status: [
        "scheduled",
        "in_transit",
        "arrived",
        "cancelled",
      ],
      inventory_reference_type: [
        "goods_receipt",
        "supplier_purchase_order",
        "purchase_order",
        "delivery_receipt",
        "pick_list",
        "manual_adjustment",
        "receipt_exception",
      ],
      inventory_txn_type: [
        "receive",
        "ship",
        "reserve",
        "release",
        "adjust",
        "return_in",
        "return_out",
      ],
      inventory_unit_status: [
        "available",
        "reserved",
        "picked",
        "shipped",
        "quarantined",
        "scrapped",
      ],
      outbound_shipment_status: [
        "scheduled",
        "loaded",
        "in_transit",
        "delivered",
        "cancelled",
      ],
      pick_list_status: ["open", "in_progress", "completed", "cancelled"],
      purchase_order_status: [
        "pending",
        "processing",
        "dispatched",
        "completed",
        "cancelled",
      ],
      purchase_request_status: [
        "draft",
        "submitted",
        "approved",
        "rejected",
        "converted",
        "cancelled",
      ],
      receipt_exception_type: [
        "damage",
        "short_ship",
        "over_ship",
        "wrong_item",
        "quality",
        "other",
      ],
      receipt_line_condition: ["ok", "damaged", "short", "wrong_item", "other"],
      sales_invoice_status: ["draft", "issued", "paid", "void"],
      supplier_order_status: [
        "draft",
        "sent",
        "partially_received",
        "received",
        "cancelled",
      ],
      user_role: ["dealer", "employee"],
    },
  },
} as const

export type Product = Tables<"products">
export type DealerProduct = Tables<"products_dealer_catalog">
export type Profile = Tables<"profiles">
export type PurchaseOrder = Tables<"purchase_orders">
export type PurchaseOrderStatus = Enums<"purchase_order_status">
export type UserRole = Enums<"user_role">
export type Announcement = Tables<"announcements">
export type CmsAsset = Tables<"cms_assets">
export type Supplier = Tables<"suppliers">
export type PurchaseRequest = Tables<"purchase_requests">
export type SupplierPurchaseOrder = Tables<"supplier_purchase_orders">
export type GoodsReceipt = Tables<"goods_receipts">
export type SalesInvoice = Tables<"sales_invoices">
export type DeliveryReceipt = Tables<"delivery_receipts">
export type PickList = Tables<"pick_lists">
export type OutboundShipment = Tables<"outbound_shipments">
export type ProofOfDelivery = Tables<"proof_of_deliveries">
