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
      audit_logs: {
        Row: {
          action: string
          actor: string
          created_at: string
          dataset: Database["public"]["Enums"]["dataset_kind"]
          detail: string
          entity: string
          id: number
        }
        Insert: {
          action: string
          actor?: string
          created_at?: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          detail?: string
          entity?: string
          id?: number
        }
        Update: {
          action?: string
          actor?: string
          created_at?: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          detail?: string
          entity?: string
          id?: number
        }
        Relationships: []
      }
      crops: {
        Row: {
          base_price: number
          category: string
          description: string
          emoji: string
          id: string
          name: string
          name_hi: string
          name_mr: string
          perishability: string
          season: string
          shelf_life_days: number
          unit: string
        }
        Insert: {
          base_price: number
          category: string
          description?: string
          emoji?: string
          id: string
          name: string
          name_hi: string
          name_mr: string
          perishability?: string
          season?: string
          shelf_life_days?: number
          unit?: string
        }
        Update: {
          base_price?: number
          category?: string
          description?: string
          emoji?: string
          id?: string
          name?: string
          name_hi?: string
          name_mr?: string
          perishability?: string
          season?: string
          shelf_life_days?: number
          unit?: string
        }
        Relationships: []
      }
      drivers: {
        Row: {
          created_at: string
          dataset: Database["public"]["Enums"]["dataset_kind"]
          earnings: number
          fleet_id: string | null
          id: string
          license_expiry: string | null
          license_no: string
          name: string
          phone: string | null
          rating: number
          status: string
          total_trips: number
          user_id: string | null
          vehicle_id: string | null
          verified: boolean
        }
        Insert: {
          created_at?: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          earnings?: number
          fleet_id?: string | null
          id?: string
          license_expiry?: string | null
          license_no?: string
          name: string
          phone?: string | null
          rating?: number
          status?: string
          total_trips?: number
          user_id?: string | null
          vehicle_id?: string | null
          verified?: boolean
        }
        Update: {
          created_at?: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          earnings?: number
          fleet_id?: string | null
          id?: string
          license_expiry?: string | null
          license_no?: string
          name?: string
          phone?: string | null
          rating?: number
          status?: string
          total_trips?: number
          user_id?: string | null
          vehicle_id?: string | null
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "drivers_fleet_id_fkey"
            columns: ["fleet_id"]
            isOneToOne: false
            referencedRelation: "fleets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      farms: {
        Row: {
          area_acres: number
          created_at: string
          dataset: Database["public"]["Enums"]["dataset_kind"]
          district: string
          farmer_name: string
          id: string
          lat: number
          lng: number
          name: string
          owner_id: string | null
          state: string
          village: string
        }
        Insert: {
          area_acres?: number
          created_at?: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          district: string
          farmer_name: string
          id?: string
          lat: number
          lng: number
          name: string
          owner_id?: string | null
          state?: string
          village: string
        }
        Update: {
          area_acres?: number
          created_at?: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          district?: string
          farmer_name?: string
          id?: string
          lat?: number
          lng?: number
          name?: string
          owner_id?: string | null
          state?: string
          village?: string
        }
        Relationships: []
      }
      fleets: {
        Row: {
          city: string
          contact: string | null
          created_at: string
          dataset: Database["public"]["Enums"]["dataset_kind"]
          id: string
          name: string
          owner_id: string | null
          rating: number
        }
        Insert: {
          city?: string
          contact?: string | null
          created_at?: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          id?: string
          name: string
          owner_id?: string | null
          rating?: number
        }
        Update: {
          city?: string
          contact?: string | null
          created_at?: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          id?: string
          name?: string
          owner_id?: string | null
          rating?: number
        }
        Relationships: []
      }
      gps_pings: {
        Row: {
          dataset: Database["public"]["Enums"]["dataset_kind"]
          id: number
          idempotency_key: string | null
          lat: number
          lng: number
          recorded_at: string
          speed_kmph: number
          trip_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          id?: number
          idempotency_key?: string | null
          lat: number
          lng: number
          recorded_at?: string
          speed_kmph?: number
          trip_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          id?: number
          idempotency_key?: string | null
          lat?: number
          lng?: number
          recorded_at?: string
          speed_kmph?: number
          trip_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gps_pings_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gps_pings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          created_at: string
          dataset: Database["public"]["Enums"]["dataset_kind"]
          description: string
          id: string
          kind: string
          reporter_id: string | null
          reporter_role: string
          severity: string
          status: string
          trip_id: string | null
        }
        Insert: {
          created_at?: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          description?: string
          id?: string
          kind: string
          reporter_id?: string | null
          reporter_role?: string
          severity?: string
          status?: string
          trip_id?: string | null
        }
        Update: {
          created_at?: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          description?: string
          id?: string
          kind?: string
          reporter_id?: string | null
          reporter_role?: string
          severity?: string
          status?: string
          trip_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          available: boolean
          created_at: string
          crop_id: string
          dataset: Database["public"]["Enums"]["dataset_kind"]
          farm_id: string | null
          grade: string
          id: string
          mandi_id: string | null
          price_per_quintal: number
          quantity_tons: number
          shipment_id: string | null
        }
        Insert: {
          available?: boolean
          created_at?: string
          crop_id: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          farm_id?: string | null
          grade?: string
          id?: string
          mandi_id?: string | null
          price_per_quintal: number
          quantity_tons: number
          shipment_id?: string | null
        }
        Update: {
          available?: boolean
          created_at?: string
          crop_id?: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          farm_id?: string | null
          grade?: string
          id?: string
          mandi_id?: string | null
          price_per_quintal?: number
          quantity_tons?: number
          shipment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_mandi_id_fkey"
            columns: ["mandi_id"]
            isOneToOne: false
            referencedRelation: "mandis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance: {
        Row: {
          cost: number
          created_at: string
          dataset: Database["public"]["Enums"]["dataset_kind"]
          id: string
          kind: string
          notes: string
          status: string
          vehicle_id: string | null
        }
        Insert: {
          cost?: number
          created_at?: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          id?: string
          kind: string
          notes?: string
          status?: string
          vehicle_id?: string | null
        }
        Update: {
          cost?: number
          created_at?: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          id?: string
          kind?: string
          notes?: string
          status?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      mandis: {
        Row: {
          capacity_tons: number
          district: string
          id: string
          lat: number
          lng: number
          name: string
          open_days: string
          state: string
        }
        Insert: {
          capacity_tons?: number
          district: string
          id: string
          lat: number
          lng: number
          name: string
          open_days?: string
          state?: string
        }
        Update: {
          capacity_tons?: number
          district?: string
          id?: string
          lat?: number
          lng?: number
          name?: string
          open_days?: string
          state?: string
        }
        Relationships: []
      }
      market_prices: {
        Row: {
          arrivals_tons: number
          crop_id: string
          id: number
          mandi_id: string
          price_per_quintal: number
          recorded_on: string
        }
        Insert: {
          arrivals_tons?: number
          crop_id: string
          id?: number
          mandi_id: string
          price_per_quintal: number
          recorded_on?: string
        }
        Update: {
          arrivals_tons?: number
          crop_id?: string
          id?: number
          mandi_id?: string
          price_per_quintal?: number
          recorded_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_prices_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_prices_mandi_id_fkey"
            columns: ["mandi_id"]
            isOneToOne: false
            referencedRelation: "mandis"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          dataset: Database["public"]["Enums"]["dataset_kind"]
          id: string
          read: boolean
          role: string
          title: string
          user_id: string | null
        }
        Insert: {
          body?: string
          created_at?: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          id?: string
          read?: boolean
          role?: string
          title: string
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          id?: string
          read?: boolean
          role?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          buyer_id: string | null
          buyer_name: string
          created_at: string
          crop_id: string | null
          dataset: Database["public"]["Enums"]["dataset_kind"]
          id: string
          listing_id: string | null
          quantity_tons: number
          status: string
          total_amount: number
        }
        Insert: {
          buyer_id?: string | null
          buyer_name?: string
          created_at?: string
          crop_id?: string | null
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          id?: string
          listing_id?: string | null
          quantity_tons: number
          status?: string
          total_amount: number
        }
        Update: {
          buyer_id?: string | null
          buyer_name?: string
          created_at?: string
          crop_id?: string | null
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          id?: string
          listing_id?: string | null
          quantity_tons?: number
          status?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          language: string
          phone: string | null
          theme: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          id: string
          language?: string
          phone?: string | null
          theme?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          language?: string
          phone?: string | null
          theme?: string
        }
        Relationships: []
      }
      quality_reports: {
        Row: {
          created_at: string
          dataset: Database["public"]["Enums"]["dataset_kind"]
          grade: string
          id: string
          moisture_pct: number | null
          notes: string
          photo_url: string | null
          shipment_id: string | null
          verified: boolean
        }
        Insert: {
          created_at?: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          grade: string
          id?: string
          moisture_pct?: number | null
          notes?: string
          photo_url?: string | null
          shipment_id?: string | null
          verified?: boolean
        }
        Update: {
          created_at?: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          grade?: string
          id?: string
          moisture_pct?: number | null
          notes?: string
          photo_url?: string | null
          shipment_id?: string | null
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "quality_reports_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          created_at: string
          crop_id: string
          dataset: Database["public"]["Enums"]["dataset_kind"]
          distance_km: number
          eta_minutes: number
          expected_amount: number
          farm_id: string | null
          harvest_date: string
          id: string
          mandi_id: string
          owner_id: string | null
          payment_status: string
          pool_savings: number
          pooled: boolean
          priority: string
          quality_grade: string
          quantity_tons: number
          status: string
          transport_cost: number
        }
        Insert: {
          created_at?: string
          crop_id: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          distance_km?: number
          eta_minutes?: number
          expected_amount?: number
          farm_id?: string | null
          harvest_date?: string
          id?: string
          mandi_id: string
          owner_id?: string | null
          payment_status?: string
          pool_savings?: number
          pooled?: boolean
          priority?: string
          quality_grade?: string
          quantity_tons: number
          status?: string
          transport_cost?: number
        }
        Update: {
          created_at?: string
          crop_id?: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          distance_km?: number
          eta_minutes?: number
          expected_amount?: number
          farm_id?: string | null
          harvest_date?: string
          id?: string
          mandi_id?: string
          owner_id?: string | null
          payment_status?: string
          pool_savings?: number
          pooled?: boolean
          priority?: string
          quality_grade?: string
          quantity_tons?: number
          status?: string
          transport_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "shipments_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_mandi_id_fkey"
            columns: ["mandi_id"]
            isOneToOne: false
            referencedRelation: "mandis"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          body: string
          created_at: string
          dataset: Database["public"]["Enums"]["dataset_kind"]
          id: string
          role: string
          status: string
          subject: string
          user_id: string | null
        }
        Insert: {
          body?: string
          created_at?: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          id?: string
          role?: string
          status?: string
          subject: string
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          id?: string
          role?: string
          status?: string
          subject?: string
          user_id?: string | null
        }
        Relationships: []
      }
      system_state: {
        Row: {
          demo_status: string
          demo_tick: number
          id: number
          mode: Database["public"]["Enums"]["dataset_kind"]
          updated_at: string
        }
        Insert: {
          demo_status?: string
          demo_tick?: number
          id?: number
          mode?: Database["public"]["Enums"]["dataset_kind"]
          updated_at?: string
        }
        Update: {
          demo_status?: string
          demo_tick?: number
          id?: number
          mode?: Database["public"]["Enums"]["dataset_kind"]
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          dataset: Database["public"]["Enums"]["dataset_kind"]
          id: string
          kind: string
          note: string
          role: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          id?: string
          kind: string
          note?: string
          role?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          id?: string
          kind?: string
          note?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      trip_events: {
        Row: {
          created_at: string
          dataset: Database["public"]["Enums"]["dataset_kind"]
          id: number
          note: string
          status: string
          trip_id: string
        }
        Insert: {
          created_at?: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          id?: number
          note?: string
          status: string
          trip_id: string
        }
        Update: {
          created_at?: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          id?: number
          note?: string
          status?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_events_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          completed_at: string | null
          created_at: string
          dataset: Database["public"]["Enums"]["dataset_kind"]
          distance_km: number
          driver_id: string | null
          eta_minutes: number
          id: string
          load_tons: number
          payout: number
          progress: number
          shipment_id: string | null
          started_at: string | null
          status: string
          vehicle_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          distance_km?: number
          driver_id?: string | null
          eta_minutes?: number
          id?: string
          load_tons?: number
          payout?: number
          progress?: number
          shipment_id?: string | null
          started_at?: string | null
          status?: string
          vehicle_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          distance_km?: number
          driver_id?: string | null
          eta_minutes?: number
          id?: string
          load_tons?: number
          payout?: number
          progress?: number
          shipment_id?: string | null
          started_at?: string | null
          status?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
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
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          capacity_tons: number
          created_at: string
          dataset: Database["public"]["Enums"]["dataset_kind"]
          fleet_id: string | null
          id: string
          lat: number
          lng: number
          odometer_km: number
          refrigerated: boolean
          reg_no: string
          status: string
          vehicle_type: string
        }
        Insert: {
          capacity_tons: number
          created_at?: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          fleet_id?: string | null
          id?: string
          lat?: number
          lng?: number
          odometer_km?: number
          refrigerated?: boolean
          reg_no: string
          status?: string
          vehicle_type?: string
        }
        Update: {
          capacity_tons?: number
          created_at?: string
          dataset?: Database["public"]["Enums"]["dataset_kind"]
          fleet_id?: string | null
          id?: string
          lat?: number
          lng?: number
          odometer_km?: number
          refrigerated?: boolean
          reg_no?: string
          status?: string
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_fleet_id_fkey"
            columns: ["fleet_id"]
            isOneToOne: false
            referencedRelation: "fleets"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_snapshots: {
        Row: {
          condition: string
          district: string
          humidity: number
          id: number
          rain_mm: number
          recorded_on: string
          spoilage_risk: string
          temp_c: number
        }
        Insert: {
          condition: string
          district: string
          humidity: number
          id?: number
          rain_mm?: number
          recorded_on?: string
          spoilage_risk?: string
          temp_c: number
        }
        Update: {
          condition?: string
          district?: string
          humidity?: number
          id?: number
          rain_mm?: number
          recorded_on?: string
          spoilage_risk?: string
          temp_c?: number
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
      owns_shipment: { Args: { _shipment_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "farmer" | "driver" | "fleet" | "buyer" | "admin"
      dataset_kind: "real" | "demo"
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
      app_role: ["farmer", "driver", "fleet", "buyer", "admin"],
      dataset_kind: ["real", "demo"],
    },
  },
} as const
