export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string
          vivareal_id: string | null
          source_url: string
          title: string
          description: string | null
          property_type: string | null
          listing_type: string | null
          status: string | null
          price_monthly: number | null
          price_total: number | null
          condominium_fee: number | null
          iptu_annual: number | null
          iptu_monthly: number | null
          area_total: number | null
          area_useful: number | null
          bedrooms: number | null
          bathrooms: number | null
          parking_spaces: number | null
          floor: number | null
          furnished: string | null
          address_full: string | null
          address_street: string | null
          address_number: string | null
          address_neighborhood: string | null
          address_city: string | null
          address_state: string | null
          address_zipcode: string | null
          latitude: number | null
          longitude: number | null
          location: unknown | null
          image_url: string | null
          image_alt: string | null
          images: Json | null
          features: Json | null
          ai_summary: string | null
          ai_highlights: Json | null
          ai_embedding: unknown | null
          scraped_at: string | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          vivareal_id?: string | null
          source_url: string
          title: string
          description?: string | null
          property_type?: string | null
          listing_type?: string | null
          status?: string | null
          price_monthly?: number | null
          price_total?: number | null
          condominium_fee?: number | null
          iptu_annual?: number | null
          iptu_monthly?: number | null
          area_total?: number | null
          area_useful?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          parking_spaces?: number | null
          floor?: number | null
          furnished?: string | null
          address_full?: string | null
          address_street?: string | null
          address_number?: string | null
          address_neighborhood?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zipcode?: string | null
          latitude?: number | null
          longitude?: number | null
          location?: unknown | null
          image_url?: string | null
          image_alt?: string | null
          images?: Json | null
          features?: Json | null
          ai_summary?: string | null
          ai_highlights?: Json | null
          ai_embedding?: unknown | null
          scraped_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          vivareal_id?: string | null
          source_url?: string
          title?: string
          description?: string | null
          property_type?: string | null
          listing_type?: string | null
          status?: string | null
          price_monthly?: number | null
          price_total?: number | null
          condominium_fee?: number | null
          iptu_annual?: number | null
          iptu_monthly?: number | null
          area_total?: number | null
          area_useful?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          parking_spaces?: number | null
          floor?: number | null
          furnished?: string | null
          address_full?: string | null
          address_street?: string | null
          address_number?: string | null
          address_neighborhood?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zipcode?: string | null
          latitude?: number | null
          longitude?: number | null
          location?: unknown | null
          image_url?: string | null
          image_alt?: string | null
          images?: Json | null
          features?: Json | null
          ai_summary?: string | null
          ai_highlights?: Json | null
          ai_embedding?: unknown | null
          scraped_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
      }
      clients: {
        Row: {
          id: string
          full_name: string
          email: string | null
          phone: string
          agent_id: string | null
          organization_id: string | null
          status: string | null
          source: string | null
          budget_min: number | null
          budget_max: number | null
          preferred_neighborhoods: string[] | null
          preferred_property_types: string[] | null
          min_bedrooms: number | null
          min_bathrooms: number | null
          required_features: string[] | null
          preferences_embedding: unknown | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
          converted_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          full_name: string
          email?: string | null
          phone: string
          agent_id?: string | null
          organization_id?: string | null
          status?: string | null
          source?: string | null
          budget_min?: number | null
          budget_max?: number | null
          preferred_neighborhoods?: string[] | null
          preferred_property_types?: string[] | null
          min_bedrooms?: number | null
          min_bathrooms?: number | null
          required_features?: string[] | null
          preferences_embedding?: unknown | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
          converted_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          email?: string | null
          phone?: string
          agent_id?: string | null
          organization_id?: string | null
          status?: string | null
          source?: string | null
          budget_min?: number | null
          budget_max?: number | null
          preferred_neighborhoods?: string[] | null
          preferred_property_types?: string[] | null
          min_bedrooms?: number | null
          min_bathrooms?: number | null
          required_features?: string[] | null
          preferences_embedding?: unknown | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
          converted_at?: string | null
          deleted_at?: string | null
        }
      }
      ai_conversations: {
        Row: {
          id: string
          user_id: string | null
          client_id: string | null
          conversation_type: string | null
          messages: Json
          related_property_ids: string[] | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          client_id?: string | null
          conversation_type?: string | null
          messages?: Json
          related_property_ids?: string[] | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          client_id?: string | null
          conversation_type?: string | null
          messages?: Json
          related_property_ids?: string[] | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      viewings: {
        Row: {
          id: string
          property_id: string | null
          agent_id: string | null
          client_id: string | null
          scheduled_at: string
          duration_minutes: number | null
          status: string | null
          meeting_type: string | null
          meeting_link: string | null
          client_feedback: string | null
          client_rating: number | null
          agent_notes: string | null
          follow_up_required: boolean | null
          follow_up_date: string | null
          created_at: string | null
          updated_at: string | null
          completed_at: string | null
          cancelled_at: string | null
        }
        Insert: {
          id?: string
          property_id?: string | null
          agent_id?: string | null
          client_id?: string | null
          scheduled_at: string
          duration_minutes?: number | null
          status?: string | null
          meeting_type?: string | null
          meeting_link?: string | null
          client_feedback?: string | null
          client_rating?: number | null
          agent_notes?: string | null
          follow_up_required?: boolean | null
          follow_up_date?: string | null
          created_at?: string | null
          updated_at?: string | null
          completed_at?: string | null
          cancelled_at?: string | null
        }
        Update: {
          id?: string
          property_id?: string | null
          agent_id?: string | null
          client_id?: string | null
          scheduled_at?: string
          duration_minutes?: number | null
          status?: string | null
          meeting_type?: string | null
          meeting_link?: string | null
          client_feedback?: string | null
          client_rating?: number | null
          agent_notes?: string | null
          follow_up_required?: boolean | null
          follow_up_date?: string | null
          created_at?: string | null
          updated_at?: string | null
          completed_at?: string | null
          cancelled_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
