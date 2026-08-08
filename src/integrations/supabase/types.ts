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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      api_fallback_stats: {
        Row: {
          created_at: string
          id: string
          latency_ms: number
          outcome: string
          tier: string
        }
        Insert: {
          created_at?: string
          id?: string
          latency_ms?: number
          outcome: string
          tier: string
        }
        Update: {
          created_at?: string
          id?: string
          latency_ms?: number
          outcome?: string
          tier?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          detail: Json
          entity: string
          entity_id: string | null
          id: string
          lat: number | null
          lng: number | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          detail?: Json
          entity: string
          entity_id?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          detail?: Json
          entity?: string
          entity_id?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
        }
        Relationships: []
      }
      commission_config: {
        Row: {
          diesel_price: number
          id: number
          petrol_price: number
          rate_percent: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          diesel_price?: number
          id?: number
          petrol_price?: number
          rate_percent?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          diesel_price?: number
          id?: number
          petrol_price?: number
          rate_percent?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      consents: {
        Row: {
          created_at: string
          granted: boolean
          id: string
          purpose: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted?: boolean
          id?: string
          purpose: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted?: boolean
          id?: string
          purpose?: string
          user_id?: string
        }
        Relationships: []
      }
      crops: {
        Row: {
          crate_kg: number
          created_at: string
          id: string
          name_en: string
          name_hi: string
          name_mr: string
          perishable: boolean
          slug: string
          spoilage_hours: number
        }
        Insert: {
          crate_kg?: number
          created_at?: string
          id?: string
          name_en: string
          name_hi: string
          name_mr: string
          perishable?: boolean
          slug: string
          spoilage_hours?: number
        }
        Update: {
          crate_kg?: number
          created_at?: string
          id?: string
          name_en?: string
          name_hi?: string
          name_mr?: string
          perishable?: boolean
          slug?: string
          spoilage_hours?: number
        }
        Relationships: []
      }
      driver_kyc: {
        Row: {
          created_at: string
          doc_type: string
          driver_id: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["kyc_status"]
          storage_path: string
        }
        Insert: {
          created_at?: string
          doc_type: string
          driver_id: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          storage_path: string
        }
        Update: {
          created_at?: string
          doc_type?: string
          driver_id?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_kyc_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          company_id: string | null
          created_at: string
          full_name: string
          home_lat: number
          home_lng: number
          hours_today: number
          id: string
          kyc_status: Database["public"]["Enums"]["kyc_status"]
          license_number: string | null
          night_mode: boolean
          phone: string | null
          radius_km: number
          rejection_reason: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          full_name: string
          home_lat?: number
          home_lng?: number
          hours_today?: number
          id?: string
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          license_number?: string | null
          night_mode?: boolean
          phone?: string | null
          radius_km?: number
          rejection_reason?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          full_name?: string
          home_lat?: number
          home_lng?: number
          hours_today?: number
          id?: string
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          license_number?: string | null
          night_mode?: boolean
          phone?: string | null
          radius_km?: number
          rejection_reason?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "fleet_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      fleet_companies: {
        Row: {
          base_taluka: string | null
          contact_phone: string | null
          created_at: string
          geofence_radius_km: number
          id: string
          name: string
          owner_id: string | null
          status: Database["public"]["Enums"]["kyc_status"]
          tax_id: string
          updated_at: string
        }
        Insert: {
          base_taluka?: string | null
          contact_phone?: string | null
          created_at?: string
          geofence_radius_km?: number
          id?: string
          name: string
          owner_id?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          tax_id: string
          updated_at?: string
        }
        Update: {
          base_taluka?: string | null
          contact_phone?: string | null
          created_at?: string
          geofence_radius_km?: number
          id?: string
          name?: string
          owner_id?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          tax_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      handover_tokens: {
        Row: {
          created_at: string
          id: string
          scanned_at: string | null
          scanned_by: string | null
          shipment_id: string
          token: string
        }
        Insert: {
          created_at?: string
          id?: string
          scanned_at?: string | null
          scanned_by?: string | null
          shipment_id: string
          token: string
        }
        Update: {
          created_at?: string
          id?: string
          scanned_at?: string | null
          scanned_by?: string | null
          shipment_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "handover_tokens_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipment_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_logs: {
        Row: {
          cost: number
          created_at: string
          id: string
          note: string
          odometer_km: number | null
          vehicle_id: string
        }
        Insert: {
          cost?: number
          created_at?: string
          id?: string
          note: string
          odometer_km?: number | null
          vehicle_id: string
        }
        Update: {
          cost?: number
          created_at?: string
          id?: string
          note?: string
          odometer_km?: number | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      mandi_prices: {
        Row: {
          created_at: string
          crop_id: string
          effective_at: string
          id: string
          mandi_id: string
          overridden_by: string | null
          price_per_kg: number
          source: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          crop_id: string
          effective_at?: string
          id?: string
          mandi_id: string
          overridden_by?: string | null
          price_per_kg: number
          source?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          crop_id?: string
          effective_at?: string
          id?: string
          mandi_id?: string
          overridden_by?: string | null
          price_per_kg?: number
          source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mandi_prices_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mandi_prices_mandi_id_fkey"
            columns: ["mandi_id"]
            isOneToOne: false
            referencedRelation: "mandis"
            referencedColumns: ["id"]
          },
        ]
      }
      mandis: {
        Row: {
          avg_gate_queue_minutes: number
          code: string
          created_at: string
          district: string
          id: string
          lat: number
          lng: number
          name: string
          peak_hours: string
          taluka: string
        }
        Insert: {
          avg_gate_queue_minutes?: number
          code: string
          created_at?: string
          district: string
          id?: string
          lat: number
          lng: number
          name: string
          peak_hours?: string
          taluka: string
        }
        Update: {
          avg_gate_queue_minutes?: number
          code?: string
          created_at?: string
          district?: string
          id?: string
          lat?: number
          lng?: number
          name?: string
          peak_hours?: string
          taluka?: string
        }
        Relationships: []
      }
      payouts: {
        Row: {
          commission: number
          company_id: string | null
          created_at: string
          driver_id: string | null
          gross_amount: number
          id: string
          net_amount: number
          status: string
          trip_id: string | null
        }
        Insert: {
          commission?: number
          company_id?: string | null
          created_at?: string
          driver_id?: string | null
          gross_amount?: number
          id?: string
          net_amount?: number
          status?: string
          trip_id?: string | null
        }
        Update: {
          commission?: number
          company_id?: string | null
          created_at?: string
          driver_id?: string | null
          gross_amount?: number
          id?: string
          net_amount?: number
          status?: string
          trip_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "fleet_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      pools: {
        Row: {
          center_lat: number
          center_lng: number
          closes_at: string
          created_at: string
          crop_id: string | null
          id: string
          mandi_id: string | null
          status: string
          total_freight: number
          total_weight_kg: number
        }
        Insert: {
          center_lat: number
          center_lng: number
          closes_at?: string
          created_at?: string
          crop_id?: string | null
          id?: string
          mandi_id?: string | null
          status?: string
          total_freight?: number
          total_weight_kg?: number
        }
        Update: {
          center_lat?: number
          center_lng?: number
          closes_at?: string
          created_at?: string
          crop_id?: string | null
          id?: string
          mandi_id?: string | null
          status?: string
          total_freight?: number
          total_weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "pools_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pools_mandi_id_fkey"
            columns: ["mandi_id"]
            isOneToOne: false
            referencedRelation: "mandis"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          dpdp_consent: boolean
          full_name: string
          id: string
          language: string
          phone: string | null
          updated_at: string
          village: string | null
        }
        Insert: {
          created_at?: string
          dpdp_consent?: boolean
          full_name?: string
          id: string
          language?: string
          phone?: string | null
          updated_at?: string
          village?: string | null
        }
        Update: {
          created_at?: string
          dpdp_consent?: boolean
          full_name?: string
          id?: string
          language?: string
          phone?: string | null
          updated_at?: string
          village?: string | null
        }
        Relationships: []
      }
      shipment_requests: {
        Row: {
          created_at: string
          crop_id: string
          distance_km: number
          emergency: boolean
          farmer_id: string
          freight_share: number
          gross_payout: number
          id: string
          mandi_id: string
          mode: string
          net_payout: number
          pickup_lat: number
          pickup_lng: number
          platform_fee: number
          pool_id: string | null
          spoilage_deadline: string | null
          status: Database["public"]["Enums"]["shipment_status"]
          updated_at: string
          village_name: string
          weight_kg: number
        }
        Insert: {
          created_at?: string
          crop_id: string
          distance_km?: number
          emergency?: boolean
          farmer_id: string
          freight_share?: number
          gross_payout?: number
          id?: string
          mandi_id: string
          mode?: string
          net_payout?: number
          pickup_lat: number
          pickup_lng: number
          platform_fee?: number
          pool_id?: string | null
          spoilage_deadline?: string | null
          status?: Database["public"]["Enums"]["shipment_status"]
          updated_at?: string
          village_name: string
          weight_kg: number
        }
        Update: {
          created_at?: string
          crop_id?: string
          distance_km?: number
          emergency?: boolean
          farmer_id?: string
          freight_share?: number
          gross_payout?: number
          id?: string
          mandi_id?: string
          mode?: string
          net_payout?: number
          pickup_lat?: number
          pickup_lng?: number
          platform_fee?: number
          pool_id?: string | null
          spoilage_deadline?: string | null
          status?: Database["public"]["Enums"]["shipment_status"]
          updated_at?: string
          village_name?: string
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "shipment_requests_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_requests_mandi_id_fkey"
            columns: ["mandi_id"]
            isOneToOne: false
            referencedRelation: "mandis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_requests_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_stops: {
        Row: {
          arrived_at: string | null
          created_at: string
          id: string
          label: string
          lat: number
          leg_km: number
          lng: number
          sequence: number
          shipment_id: string | null
          trip_id: string
          unpaved: boolean
        }
        Insert: {
          arrived_at?: string | null
          created_at?: string
          id?: string
          label: string
          lat: number
          leg_km?: number
          lng: number
          sequence: number
          shipment_id?: string | null
          trip_id: string
          unpaved?: boolean
        }
        Update: {
          arrived_at?: string | null
          created_at?: string
          id?: string
          label?: string
          lat?: number
          leg_km?: number
          lng?: number
          sequence?: number
          shipment_id?: string | null
          trip_id?: string
          unpaved?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "trip_stops_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipment_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_stops_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          company_id: string | null
          completed_at: string | null
          created_at: string
          diesel_cost: number
          driver_id: string | null
          driver_net: number
          gross_freight: number
          id: string
          mandi_id: string | null
          pool_id: string | null
          proof_lat: number | null
          proof_lng: number | null
          proof_photo_path: string | null
          router_tier: string
          started_at: string | null
          status: Database["public"]["Enums"]["trip_status"]
          toll_cost: number
          total_distance_km: number
          total_weight_kg: number
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          company_id?: string | null
          completed_at?: string | null
          created_at?: string
          diesel_cost?: number
          driver_id?: string | null
          driver_net?: number
          gross_freight?: number
          id?: string
          mandi_id?: string | null
          pool_id?: string | null
          proof_lat?: number | null
          proof_lng?: number | null
          proof_photo_path?: string | null
          router_tier?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["trip_status"]
          toll_cost?: number
          total_distance_km?: number
          total_weight_kg?: number
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          company_id?: string | null
          completed_at?: string | null
          created_at?: string
          diesel_cost?: number
          driver_id?: string | null
          driver_net?: number
          gross_freight?: number
          id?: string
          mandi_id?: string | null
          pool_id?: string | null
          proof_lat?: number | null
          proof_lng?: number | null
          proof_photo_path?: string | null
          router_tier?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["trip_status"]
          toll_cost?: number
          total_distance_km?: number
          total_weight_kg?: number
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trips_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "fleet_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_mandi_id_fkey"
            columns: ["mandi_id"]
            isOneToOne: false
            referencedRelation: "mandis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_types: {
        Row: {
          base_cost_per_km: number
          created_at: string
          fuel: string
          id: string
          mileage_kmpl: number
          name: string
          payload_kg: number
          slug: string
          toll_allowance_per_km: number
        }
        Insert: {
          base_cost_per_km: number
          created_at?: string
          fuel?: string
          id?: string
          mileage_kmpl: number
          name: string
          payload_kg: number
          slug: string
          toll_allowance_per_km?: number
        }
        Update: {
          base_cost_per_km?: number
          created_at?: string
          fuel?: string
          id?: string
          mileage_kmpl?: number
          name?: string
          payload_kg?: number
          slug?: string
          toll_allowance_per_km?: number
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          active: boolean
          axle_health: string
          company_id: string | null
          created_at: string
          driver_id: string | null
          id: string
          last_service_at: string | null
          observed_kmpl: number | null
          odometer_km: number
          owner_id: string | null
          registration: string
          updated_at: string
          vehicle_type_id: string
        }
        Insert: {
          active?: boolean
          axle_health?: string
          company_id?: string | null
          created_at?: string
          driver_id?: string | null
          id?: string
          last_service_at?: string | null
          observed_kmpl?: number | null
          odometer_km?: number
          owner_id?: string | null
          registration: string
          updated_at?: string
          vehicle_type_id: string
        }
        Update: {
          active?: boolean
          axle_health?: string
          company_id?: string | null
          created_at?: string
          driver_id?: string | null
          id?: string
          last_service_at?: string | null
          observed_kmpl?: number | null
          odometer_km?: number
          owner_id?: string | null
          registration?: string
          updated_at?: string
          vehicle_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "fleet_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_vehicle_type_id_fkey"
            columns: ["vehicle_type_id"]
            isOneToOne: false
            referencedRelation: "vehicle_types"
            referencedColumns: ["id"]
          },
        ]
      }
      villages: {
        Row: {
          created_at: string
          district: string
          id: string
          lat: number
          lng: number
          name: string
          taluka: string
          unpaved_access: boolean
        }
        Insert: {
          created_at?: string
          district?: string
          id?: string
          lat: number
          lng: number
          name: string
          taluka: string
          unpaved_access?: boolean
        }
        Update: {
          created_at?: string
          district?: string
          id?: string
          lat?: number
          lng?: number
          name?: string
          taluka?: string
          unpaved_access?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      haversine_km: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
    }
    Enums: {
      app_role: "farmer" | "driver" | "fleet" | "admin"
      kyc_status: "pending" | "approved" | "rejected"
      shipment_status:
        | "PENDING_POOL"
        | "POOLED"
        | "SOLO_CONFIRMED"
        | "ASSIGNED"
        | "IN_TRANSIT"
        | "DELIVERED"
        | "CANCELLED"
      trip_status: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED"
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
  public: {
    Enums: {
      app_role: ["farmer", "driver", "fleet", "admin"],
      kyc_status: ["pending", "approved", "rejected"],
      shipment_status: [
        "PENDING_POOL",
        "POOLED",
        "SOLO_CONFIRMED",
        "ASSIGNED",
        "IN_TRANSIT",
        "DELIVERED",
        "CANCELLED",
      ],
      trip_status: ["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"],
    },
  },
} as const
