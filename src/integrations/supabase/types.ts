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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          allowed_ips: string[] | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          monthly_quota: number | null
          name: string
          request_count: number | null
          scopes: string[] | null
          user_id: string | null
        }
        Insert: {
          allowed_ips?: string[] | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          monthly_quota?: number | null
          name: string
          request_count?: number | null
          scopes?: string[] | null
          user_id?: string | null
        }
        Update: {
          allowed_ips?: string[] | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          monthly_quota?: number | null
          name?: string
          request_count?: number | null
          scopes?: string[] | null
          user_id?: string | null
        }
        Relationships: []
      }
      api_usage_logs: {
        Row: {
          api_key_id: string | null
          created_at: string | null
          endpoint: string
          id: string
          method: string
          status_code: number
          user_id: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string | null
          endpoint: string
          id?: string
          method: string
          status_code: number
          user_id?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string | null
          endpoint?: string
          id?: string
          method?: string
          status_code?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          event_type: string
          id: string
          ip_address: unknown
          new_data: Json | null
          new_values: Json | null
          old_data: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          new_values?: Json | null
          old_data?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          new_values?: Json | null
          old_data?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      availability_rules: {
        Row: {
          created_at: string
          end_date: string
          end_time: string | null
          id: string
          modification: Json | null
          restaurant_id: string
          rule_type: string
          start_date: string
          start_time: string | null
        }
        Insert: {
          created_at?: string
          end_date: string
          end_time?: string | null
          id?: string
          modification?: Json | null
          restaurant_id: string
          rule_type: string
          start_date: string
          start_time?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string
          end_time?: string | null
          id?: string
          modification?: Json | null
          restaurant_id?: string
          rule_type?: string
          start_date?: string
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_rules_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "availability_rules_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_rules_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_rules_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_audit_log: {
        Row: {
          booking_id: string | null
          change_type: string
          changed_at: string | null
          changed_by: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
        }
        Insert: {
          booking_id?: string | null
          change_type: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
        }
        Update: {
          booking_id?: string | null
          change_type?: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_audit_log_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      capacity_alerts: {
        Row: {
          action_required: boolean | null
          action_suggestions: Json | null
          affected_resource: string | null
          alert_level: string
          alert_type: string
          auto_scaling_triggered: boolean | null
          created_by: string | null
          current_value: number | null
          description: string
          estimated_resolution_time_minutes: number | null
          id: string
          peak_hour_status: boolean | null
          percentage_over_limit: number | null
          resolved_at: string | null
          resolved_by: string | null
          restaurant_id: string
          status: string | null
          tenant_id: string
          threshold_value: number | null
          title: string
          triggered_at: string | null
          updated_at: string | null
        }
        Insert: {
          action_required?: boolean | null
          action_suggestions?: Json | null
          affected_resource?: string | null
          alert_level: string
          alert_type: string
          auto_scaling_triggered?: boolean | null
          created_by?: string | null
          current_value?: number | null
          description: string
          estimated_resolution_time_minutes?: number | null
          id?: string
          peak_hour_status?: boolean | null
          percentage_over_limit?: number | null
          resolved_at?: string | null
          resolved_by?: string | null
          restaurant_id: string
          status?: string | null
          tenant_id: string
          threshold_value?: number | null
          title: string
          triggered_at?: string | null
          updated_at?: string | null
        }
        Update: {
          action_required?: boolean | null
          action_suggestions?: Json | null
          affected_resource?: string | null
          alert_level?: string
          alert_type?: string
          auto_scaling_triggered?: boolean | null
          created_by?: string | null
          current_value?: number | null
          description?: string
          estimated_resolution_time_minutes?: number | null
          id?: string
          peak_hour_status?: boolean | null
          percentage_over_limit?: number | null
          resolved_at?: string | null
          resolved_by?: string | null
          restaurant_id?: string
          status?: string | null
          tenant_id?: string
          threshold_value?: number | null
          title?: string
          triggered_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "capacity_alerts_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "capacity_alerts_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capacity_alerts_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capacity_alerts_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
        ]
      }
      capacity_monitoring: {
        Row: {
          actual_capacity: number
          available_seats: number | null
          capacity_buffer_remaining: number | null
          date_recorded: string
          id: string
          overbooked_count: number | null
          peak_multiplier: number | null
          performance_score: number | null
          recorded_at: string | null
          reserved_seats: number | null
          restaurant_id: string
          restaurant_location_id: string | null
          time_slot: string
          updated_at: string | null
          utilization_percentage: number | null
          waitlist_count: number | null
        }
        Insert: {
          actual_capacity: number
          available_seats?: number | null
          capacity_buffer_remaining?: number | null
          date_recorded: string
          id?: string
          overbooked_count?: number | null
          peak_multiplier?: number | null
          performance_score?: number | null
          recorded_at?: string | null
          reserved_seats?: number | null
          restaurant_id: string
          restaurant_location_id?: string | null
          time_slot: string
          updated_at?: string | null
          utilization_percentage?: number | null
          waitlist_count?: number | null
        }
        Update: {
          actual_capacity?: number
          available_seats?: number | null
          capacity_buffer_remaining?: number | null
          date_recorded?: string
          id?: string
          overbooked_count?: number | null
          peak_multiplier?: number | null
          performance_score?: number | null
          recorded_at?: string | null
          reserved_seats?: number | null
          restaurant_id?: string
          restaurant_location_id?: string | null
          time_slot?: string
          updated_at?: string | null
          utilization_percentage?: number | null
          waitlist_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "capacity_monitoring_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "capacity_monitoring_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capacity_monitoring_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capacity_monitoring_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
        ]
      }
      capacity_tolerance_settings: {
        Row: {
          buffer_percentage: number | null
          created_at: string | null
          created_by: string | null
          dynamic_capacity_enabled: boolean | null
          emergency_capacity_percentage: number | null
          id: string
          overbooking_percentage: number | null
          peak_hour_boost: number | null
          peak_hours: Json | null
          queue_management_enabled: boolean | null
          restaurant_id: string
          seasonal_adjustments: Json | null
          updated_at: string | null
          waitlist_capacity: number | null
        }
        Insert: {
          buffer_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          dynamic_capacity_enabled?: boolean | null
          emergency_capacity_percentage?: number | null
          id?: string
          overbooking_percentage?: number | null
          peak_hour_boost?: number | null
          peak_hours?: Json | null
          queue_management_enabled?: boolean | null
          restaurant_id: string
          seasonal_adjustments?: Json | null
          updated_at?: string | null
          waitlist_capacity?: number | null
        }
        Update: {
          buffer_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          dynamic_capacity_enabled?: boolean | null
          emergency_capacity_percentage?: number | null
          id?: string
          overbooking_percentage?: number | null
          peak_hour_boost?: number | null
          peak_hours?: Json | null
          queue_management_enabled?: boolean | null
          restaurant_id?: string
          seasonal_adjustments?: Json | null
          updated_at?: string | null
          waitlist_capacity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "capacity_tolerance_settings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "capacity_tolerance_settings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capacity_tolerance_settings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capacity_tolerance_settings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
        ]
      }
      chef_bookings: {
        Row: {
          booking_date: string
          booking_time: string
          chef_id: string
          created_at: string | null
          duration: number
          guest_count: number
          id: string
          location: string
          menu_description: string | null
          payment_status: string | null
          special_requests: string | null
          status: string | null
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_date: string
          booking_time: string
          chef_id: string
          created_at?: string | null
          duration: number
          guest_count: number
          id?: string
          location: string
          menu_description?: string | null
          payment_status?: string | null
          special_requests?: string | null
          status?: string | null
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_date?: string
          booking_time?: string
          chef_id?: string
          created_at?: string | null
          duration?: number
          guest_count?: number
          id?: string
          location?: string
          menu_description?: string | null
          payment_status?: string | null
          special_requests?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chef_bookings_chef_id_fkey"
            columns: ["chef_id"]
            isOneToOne: false
            referencedRelation: "chefs"
            referencedColumns: ["id"]
          },
        ]
      }
      chefs: {
        Row: {
          available_dates: string[] | null
          bio: string | null
          created_at: string | null
          hourly_rate: number
          id: string
          image: string | null
          languages: string[] | null
          location: string
          name: string
          signature_dishes: string[] | null
          specialty: string
          updated_at: string | null
          user_id: string
          years_experience: number
        }
        Insert: {
          available_dates?: string[] | null
          bio?: string | null
          created_at?: string | null
          hourly_rate: number
          id?: string
          image?: string | null
          languages?: string[] | null
          location: string
          name: string
          signature_dishes?: string[] | null
          specialty: string
          updated_at?: string | null
          user_id: string
          years_experience: number
        }
        Update: {
          available_dates?: string[] | null
          bio?: string | null
          created_at?: string | null
          hourly_rate?: number
          id?: string
          image?: string | null
          languages?: string[] | null
          location?: string
          name?: string
          signature_dishes?: string[] | null
          specialty?: string
          updated_at?: string | null
          user_id?: string
          years_experience?: number
        }
        Relationships: []
      }
      combination_table_members: {
        Row: {
          combination_id: string
          created_at: string | null
          id: string
          position: number | null
          table_id: string
          updated_at: string | null
        }
        Insert: {
          combination_id: string
          created_at?: string | null
          id?: string
          position?: number | null
          table_id: string
          updated_at?: string | null
        }
        Update: {
          combination_id?: string
          created_at?: string | null
          id?: string
          position?: number | null
          table_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "combination_table_members_combination_id_fkey"
            columns: ["combination_id"]
            isOneToOne: false
            referencedRelation: "table_combinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combination_table_members_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_documents: {
        Row: {
          created_at: string | null
          document_type: string | null
          expires_at: string | null
          id: string
          issued_date: string | null
          metadata: Json | null
          restaurant_id: string | null
        }
        Insert: {
          created_at?: string | null
          document_type?: string | null
          expires_at?: string | null
          id?: string
          issued_date?: string | null
          metadata?: Json | null
          restaurant_id?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string | null
          expires_at?: string | null
          id?: string
          issued_date?: string | null
          metadata?: Json | null
          restaurant_id?: string | null
        }
        Relationships: []
      }
      countries: {
        Row: {
          compliance_required: boolean | null
          country_code: string
          country_name: string
          created_at: string | null
          currency_code: string
          currency_rate_usd: number | null
          currency_symbol: string
          id: string
          is_active: boolean | null
          region: string
          tax_rate: number | null
          updated_at: string | null
        }
        Insert: {
          compliance_required?: boolean | null
          country_code: string
          country_name: string
          created_at?: string | null
          currency_code: string
          currency_rate_usd?: number | null
          currency_symbol: string
          id?: string
          is_active?: boolean | null
          region: string
          tax_rate?: number | null
          updated_at?: string | null
        }
        Update: {
          compliance_required?: boolean | null
          country_code?: string
          country_name?: string
          created_at?: string | null
          currency_code?: string
          currency_rate_usd?: number | null
          currency_symbol?: string
          id?: string
          is_active?: boolean | null
          region?: string
          tax_rate?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      currency_exchange_rates: {
        Row: {
          created_at: string | null
          effective_date: string
          from_currency: string
          id: string
          rate: number
          rate_source: string | null
          region: string | null
          to_currency: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          effective_date: string
          from_currency: string
          id?: string
          rate: number
          rate_source?: string | null
          region?: string | null
          to_currency: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          effective_date?: string
          from_currency?: string
          id?: string
          rate?: number
          rate_source?: string | null
          region?: string | null
          to_currency?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_preferences: {
        Row: {
          communication_preferences: Json | null
          created_at: string | null
          dietary_restrictions: string[] | null
          favorite_cuisines: string[] | null
          id: string
          seating_preferences: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          communication_preferences?: Json | null
          created_at?: string | null
          dietary_restrictions?: string[] | null
          favorite_cuisines?: string[] | null
          id?: string
          seating_preferences?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          communication_preferences?: Json | null
          created_at?: string | null
          dietary_restrictions?: string[] | null
          favorite_cuisines?: string[] | null
          id?: string
          seating_preferences?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_notifications: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          email_data: Json | null
          error_message: string | null
          id: string
          provider_message_id: string | null
          recipient_email: string
          sent_at: string | null
          status: string
          subject: string
          template: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          email_data?: Json | null
          error_message?: string | null
          id?: string
          provider_message_id?: string | null
          recipient_email: string
          sent_at?: string | null
          status?: string
          subject: string
          template?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          email_data?: Json | null
          error_message?: string | null
          id?: string
          provider_message_id?: string | null
          recipient_email?: string
          sent_at?: string | null
          status?: string
          subject?: string
          template?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          context: Json | null
          created_at: string
          error_type: string
          id: string
          message: string
          severity: string | null
          stack_trace: string | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string
          error_type: string
          id?: string
          message: string
          severity?: string | null
          stack_trace?: string | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string
          error_type?: string
          id?: string
          message?: string
          severity?: string | null
          stack_trace?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          capacity: number
          created_at: string | null
          date: string
          description: string | null
          end_time: string
          id: string
          is_active: boolean | null
          location: string
          name: string
          start_time: string
          updated_at: string | null
        }
        Insert: {
          capacity: number
          created_at?: string | null
          date: string
          description?: string | null
          end_time: string
          id?: string
          is_active?: boolean | null
          location: string
          name: string
          start_time: string
          updated_at?: string | null
        }
        Update: {
          capacity?: number
          created_at?: string | null
          date?: string
          description?: string | null
          end_time?: string
          id?: string
          is_active?: boolean | null
          location?: string
          name?: string
          start_time?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      floor_plans: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          layout_data: Json | null
          name: string
          restaurant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          layout_data?: Json | null
          name: string
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          layout_data?: Json | null
          name?: string
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_floor_plans_restaurant_id_ref_restaurants"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "fk_floor_plans_restaurant_id_ref_restaurants"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_floor_plans_restaurant_id_ref_restaurants"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_floor_plans_restaurant_id_ref_restaurants"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
        ]
      }
      function_def_backups: {
        Row: {
          created_at: string | null
          definition: string | null
          func_name: string | null
          func_oid: unknown
          id: number
          language: string | null
          owner_name: string | null
          returns_set: boolean | null
          schema_name: string | null
          security_definer: boolean | null
        }
        Insert: {
          created_at?: string | null
          definition?: string | null
          func_name?: string | null
          func_oid?: unknown
          id?: number
          language?: string | null
          owner_name?: string | null
          returns_set?: boolean | null
          schema_name?: string | null
          security_definer?: boolean | null
        }
        Update: {
          created_at?: string | null
          definition?: string | null
          func_name?: string | null
          func_oid?: unknown
          id?: number
          language?: string | null
          owner_name?: string | null
          returns_set?: boolean | null
          schema_name?: string | null
          security_definer?: boolean | null
        }
        Relationships: []
      }
      ingredients: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          reorder_threshold: number | null
          restaurant_id: string | null
          unit: string
          unit_size: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          reorder_threshold?: number | null
          restaurant_id?: string | null
          unit: string
          unit_size?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          reorder_threshold?: number | null
          restaurant_id?: string | null
          unit?: string
          unit_size?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "ingredients_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredients_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredients_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          due_date: string | null
          id: string
          invoice_number: string
          line_items: Json | null
          notes: string | null
          paid_at: string | null
          payment_id: string | null
          pdf_url: string | null
          reservation_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          line_items?: Json | null
          notes?: string | null
          paid_at?: string | null
          payment_id?: string | null
          pdf_url?: string | null
          reservation_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          line_items?: Json | null
          notes?: string | null
          paid_at?: string | null
          payment_id?: string | null
          pdf_url?: string | null
          reservation_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_points: {
        Row: {
          created_at: string
          id: string
          lifetime_points: number | null
          points: number
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lifetime_points?: number | null
          points?: number
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lifetime_points?: number | null
          points?: number
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loyalty_points_transactions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          points: number
          program_id: string | null
          restaurant_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          points: number
          program_id?: string | null
          restaurant_id?: string | null
          transaction_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          program_id?: string | null
          restaurant_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      loyalty_programs: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string | null
          points_per_dollar: number | null
          restaurant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          points_per_dollar?: number | null
          restaurant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          points_per_dollar?: number | null
          restaurant_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      loyalty_redemptions: {
        Row: {
          created_at: string
          id: string
          points_used: number
          reward_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points_used: number
          reward_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points_used?: number
          reward_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "loyalty_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_rewards: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          points_required: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          points_required: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          points_required?: number
          updated_at?: string
        }
        Relationships: []
      }
      marketing_campaigns: {
        Row: {
          campaign_type: string
          content: Json | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          metrics: Json | null
          name: string
          restaurant_id: string | null
          start_date: string | null
          status: string
          target_audience: Json | null
          updated_at: string
        }
        Insert: {
          campaign_type?: string
          content?: Json | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          metrics?: Json | null
          name: string
          restaurant_id?: string | null
          start_date?: string | null
          status?: string
          target_audience?: Json | null
          updated_at?: string
        }
        Update: {
          campaign_type?: string
          content?: Json | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          metrics?: Json | null
          name?: string
          restaurant_id?: string | null
          start_date?: string | null
          status?: string
          target_audience?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "marketing_campaigns_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_campaigns_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_campaigns_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean | null
          name: string | null
          preferences: Json | null
          restaurant_id: string | null
          source: string | null
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          preferences?: Json | null
          restaurant_id?: string | null
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          preferences?: Json | null
          restaurant_id?: string | null
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_subscribers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "marketing_subscribers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_subscribers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_subscribers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          restaurant_id: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          restaurant_id: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          restaurant_id?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "menu_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_ingredients: {
        Row: {
          created_at: string | null
          id: string
          ingredient_id: string | null
          menu_item_id: string | null
          quantity_required: number
          unit: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ingredient_id?: string | null
          menu_item_id?: string | null
          quantity_required: number
          unit?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ingredient_id?: string | null
          menu_item_id?: string | null
          quantity_required?: number
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_menu_item_ingredients_ingredient_id_ref_ingredients"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_menu_item_ingredients_menu_item_id_ref_menu_items"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          allergens: string[] | null
          category_id: string | null
          created_at: string | null
          currency_code: string | null
          description: string | null
          dietary_tags: string[] | null
          id: string
          image_url: string | null
          is_available: boolean | null
          name: string
          preparation_time: number | null
          price: number
          restaurant_id: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          allergens?: string[] | null
          category_id?: string | null
          created_at?: string | null
          currency_code?: string | null
          description?: string | null
          dietary_tags?: string[] | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name: string
          preparation_time?: number | null
          price: number
          restaurant_id: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          allergens?: string[] | null
          category_id?: string | null
          created_at?: string | null
          currency_code?: string | null
          description?: string | null
          dietary_tags?: string[] | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name?: string
          preparation_time?: number | null
          price?: number
          restaurant_id?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_menu_items_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_menu_items_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "fk_menu_items_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_menu_items_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_menu_items_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          booking_confirmations: boolean | null
          created_at: string | null
          email_enabled: boolean | null
          id: string
          marketing_emails: boolean | null
          push_enabled: boolean | null
          reservation_reminders: boolean | null
          sms_enabled: boolean | null
          special_offers: boolean | null
          system_notifications: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          booking_confirmations?: boolean | null
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          push_enabled?: boolean | null
          reservation_reminders?: boolean | null
          sms_enabled?: boolean | null
          special_offers?: boolean | null
          system_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          booking_confirmations?: boolean | null
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          push_enabled?: boolean | null
          reservation_reminders?: boolean | null
          sms_enabled?: boolean | null
          special_offers?: boolean | null
          system_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          expires_at: string | null
          id: string
          message: string
          read: boolean | null
          read_at: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          read_at?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      order_audit: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          order_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          order_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_audit_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          menu_item_id: string | null
          metadata: Json | null
          order_id: string | null
          quantity: number
          total_price: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          metadata?: Json | null
          order_id?: string | null
          quantity?: number
          total_price?: number | null
          unit_price?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          metadata?: Json | null
          order_id?: string | null
          quantity?: number
          total_price?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          currency: string
          id: string
          metadata: Json | null
          reservation_id: string | null
          restaurant_id: string | null
          status: string
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string
          id?: string
          metadata?: Json | null
          reservation_id?: string | null
          restaurant_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string
          id?: string
          metadata?: Json | null
          reservation_id?: string | null
          restaurant_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_logs: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown
          payment_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          payment_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          payment_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_logs_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          billing_details: Json | null
          brand: string | null
          created_at: string | null
          expiry_month: number | null
          expiry_year: number | null
          id: string
          is_default: boolean | null
          last4: string | null
          provider: string
          provider_payment_method_id: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_details?: Json | null
          brand?: string | null
          created_at?: string | null
          expiry_month?: number | null
          expiry_year?: number | null
          id?: string
          is_default?: boolean | null
          last4?: string | null
          provider: string
          provider_payment_method_id: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_details?: Json | null
          brand?: string | null
          created_at?: string | null
          expiry_month?: number | null
          expiry_year?: number | null
          id?: string
          is_default?: boolean | null
          last4?: string | null
          provider?: string
          provider_payment_method_id?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          allow_partial_payments: boolean | null
          auto_capture: boolean | null
          created_at: string | null
          currency: string
          deposit_amount: number | null
          deposit_percentage: number | null
          is_enabled: boolean | null
          maximum_order_amount: number | null
          minimum_order_amount: number | null
          requires_deposit: boolean | null
          restaurant_id: string
          settings: Json | null
          supported_providers: string[] | null
          updated_at: string | null
        }
        Insert: {
          allow_partial_payments?: boolean | null
          auto_capture?: boolean | null
          created_at?: string | null
          currency?: string
          deposit_amount?: number | null
          deposit_percentage?: number | null
          is_enabled?: boolean | null
          maximum_order_amount?: number | null
          minimum_order_amount?: number | null
          requires_deposit?: boolean | null
          restaurant_id: string
          settings?: Json | null
          supported_providers?: string[] | null
          updated_at?: string | null
        }
        Update: {
          allow_partial_payments?: boolean | null
          auto_capture?: boolean | null
          created_at?: string | null
          currency?: string
          deposit_amount?: number | null
          deposit_percentage?: number | null
          is_enabled?: boolean | null
          maximum_order_amount?: number | null
          minimum_order_amount?: number | null
          requires_deposit?: boolean | null
          restaurant_id?: string
          settings?: Json | null
          supported_providers?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_settings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "payment_settings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_settings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_settings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          currency: string
          description: string | null
          failure_reason: string | null
          id: string
          metadata: Json | null
          payment_method_id: string | null
          provider: string
          provider_charge_id: string | null
          provider_payment_intent_id: string | null
          refunded_amount: number | null
          reservation_id: string | null
          restaurant_id: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          payment_method_id?: string | null
          provider: string
          provider_charge_id?: string | null
          provider_payment_intent_id?: string | null
          refunded_amount?: number | null
          reservation_id?: string | null
          restaurant_id?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          payment_method_id?: string | null
          provider?: string
          provider_charge_id?: string | null
          provider_payment_intent_id?: string | null
          refunded_amount?: number | null
          reservation_id?: string | null
          restaurant_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "payments_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_thresholds: {
        Row: {
          auto_adjust_thresholds: boolean | null
          concurrent_users_critical: number | null
          concurrent_users_warning: number | null
          cpu_usage_critical_percentage: number | null
          cpu_usage_warning_percentage: number | null
          created_at: string | null
          created_by: string | null
          custom_thresholds: Json | null
          database_connection_usage_critical_percentage: number | null
          database_connection_usage_warning_percentage: number | null
          database_response_time_critical_ms: number | null
          database_response_time_warning_ms: number | null
          error_rate_critical_percentage: number | null
          error_rate_warning_percentage: number | null
          id: string
          is_active: boolean | null
          memory_usage_critical_percentage: number | null
          memory_usage_warning_percentage: number | null
          requests_per_minute_critical: number | null
          requests_per_minute_warning: number | null
          response_time_critical_ms: number | null
          response_time_warning_ms: number | null
          restaurant_id: string | null
          seasonal_adjustments: Json | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          auto_adjust_thresholds?: boolean | null
          concurrent_users_critical?: number | null
          concurrent_users_warning?: number | null
          cpu_usage_critical_percentage?: number | null
          cpu_usage_warning_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          custom_thresholds?: Json | null
          database_connection_usage_critical_percentage?: number | null
          database_connection_usage_warning_percentage?: number | null
          database_response_time_critical_ms?: number | null
          database_response_time_warning_ms?: number | null
          error_rate_critical_percentage?: number | null
          error_rate_warning_percentage?: number | null
          id?: string
          is_active?: boolean | null
          memory_usage_critical_percentage?: number | null
          memory_usage_warning_percentage?: number | null
          requests_per_minute_critical?: number | null
          requests_per_minute_warning?: number | null
          response_time_critical_ms?: number | null
          response_time_warning_ms?: number | null
          restaurant_id?: string | null
          seasonal_adjustments?: Json | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_adjust_thresholds?: boolean | null
          concurrent_users_critical?: number | null
          concurrent_users_warning?: number | null
          cpu_usage_critical_percentage?: number | null
          cpu_usage_warning_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          custom_thresholds?: Json | null
          database_connection_usage_critical_percentage?: number | null
          database_connection_usage_warning_percentage?: number | null
          database_response_time_critical_ms?: number | null
          database_response_time_warning_ms?: number | null
          error_rate_critical_percentage?: number | null
          error_rate_warning_percentage?: number | null
          id?: string
          is_active?: boolean | null
          memory_usage_critical_percentage?: number | null
          memory_usage_warning_percentage?: number | null
          requests_per_minute_critical?: number | null
          requests_per_minute_warning?: number | null
          response_time_critical_ms?: number | null
          response_time_warning_ms?: number | null
          restaurant_id?: string | null
          seasonal_adjustments?: Json | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_thresholds_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "performance_thresholds_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_thresholds_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_thresholds_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: number
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: never
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: never
          name?: string
        }
        Relationships: []
      }
      plan_features: {
        Row: {
          created_at: string | null
          feature_description: string | null
          feature_id: string | null
          feature_key: string
          feature_name: string
          id: string
          is_available: boolean | null
          limit_value: number | null
          plan_id: string | null
        }
        Insert: {
          created_at?: string | null
          feature_description?: string | null
          feature_id?: string | null
          feature_key: string
          feature_name: string
          id?: string
          is_available?: boolean | null
          limit_value?: number | null
          plan_id?: string | null
        }
        Update: {
          created_at?: string | null
          feature_description?: string | null
          feature_id?: string | null
          feature_key?: string
          feature_name?: string
          id?: string
          is_available?: boolean | null
          limit_value?: number | null
          plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_features_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_usage_logs: {
        Row: {
          api_calls_count: number | null
          compliance_checks_count: number | null
          created_at: string | null
          feature_usage: Json | null
          id: string
          period_date: string
          plan_id: string | null
          reservations_count: number | null
          restaurant_id: string | null
          security_incidents_count: number | null
          usage_count: number | null
          usage_date: string | null
          usage_period: string
          usage_type: string
        }
        Insert: {
          api_calls_count?: number | null
          compliance_checks_count?: number | null
          created_at?: string | null
          feature_usage?: Json | null
          id?: string
          period_date: string
          plan_id?: string | null
          reservations_count?: number | null
          restaurant_id?: string | null
          security_incidents_count?: number | null
          usage_count?: number | null
          usage_date?: string | null
          usage_period: string
          usage_type: string
        }
        Update: {
          api_calls_count?: number | null
          compliance_checks_count?: number | null
          created_at?: string | null
          feature_usage?: Json | null
          id?: string
          period_date?: string
          plan_id?: string | null
          reservations_count?: number | null
          restaurant_id?: string | null
          security_incidents_count?: number | null
          usage_count?: number | null
          usage_date?: string | null
          usage_period?: string
          usage_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_usage_logs_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_usage_logs_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "plan_usage_logs_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_usage_logs_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_usage_logs_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          last_name: string | null
          phone_number: string | null
          preferences: Json | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          last_name?: string | null
          phone_number?: string | null
          preferences?: Json | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          last_name?: string | null
          phone_number?: string | null
          preferences?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          code: string | null
          created_at: string
          current_uses: number | null
          description: string | null
          discount_type: string
          discount_value: number
          end_date: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_order_amount: number | null
          name: string
          restaurant_id: string | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          current_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          name: string
          restaurant_id?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          current_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          name?: string
          restaurant_id?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "promotions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          created_at: string | null
          endpoint: string | null
          id: string
          subscription: Json
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint?: string | null
          id?: string
          subscription: Json
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string | null
          id?: string
          subscription?: Json
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      refunds: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          payment_id: string | null
          processed_at: string | null
          processed_by: string | null
          provider_refund_id: string | null
          reason: string | null
          reservation_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_id?: string | null
          processed_at?: string | null
          processed_by?: string | null
          provider_refund_id?: string | null
          reason?: string | null
          reservation_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_id?: string | null
          processed_at?: string | null
          processed_by?: string | null
          provider_refund_id?: string | null
          reason?: string | null
          reservation_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      regional_audit_log: {
        Row: {
          error_message: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          operation_timestamp: string | null
          operation_type: string
          record_id: string | null
          success: boolean | null
          table_name: string
          tenant_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          error_message?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          operation_timestamp?: string | null
          operation_type: string
          record_id?: string | null
          success?: boolean | null
          table_name: string
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          error_message?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          operation_timestamp?: string | null
          operation_type?: string
          record_id?: string | null
          success?: boolean | null
          table_name?: string
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      regional_compliance: {
        Row: {
          compliance_cost: number | null
          compliance_notes: string | null
          country_code: string
          created_at: string | null
          description: string | null
          id: string
          implementation_deadline: string | null
          is_mandatory: boolean | null
          regulatory_authority: string | null
          requirement_name: string
          requirement_type: string
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          compliance_cost?: number | null
          compliance_notes?: string | null
          country_code: string
          created_at?: string | null
          description?: string | null
          id?: string
          implementation_deadline?: string | null
          is_mandatory?: boolean | null
          regulatory_authority?: string | null
          requirement_name: string
          requirement_type: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          compliance_cost?: number | null
          compliance_notes?: string | null
          country_code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          implementation_deadline?: string | null
          is_mandatory?: boolean | null
          regulatory_authority?: string | null
          requirement_name?: string
          requirement_type?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      regional_compliance_archive: {
        Row: {
          archived_at: string | null
          compliance_cost: number | null
          compliance_notes: string | null
          country_code: string
          created_at: string | null
          description: string | null
          id: string
          implementation_deadline: string | null
          is_mandatory: boolean | null
          original_table: string | null
          regulatory_authority: string | null
          requirement_name: string
          requirement_type: string
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          compliance_cost?: number | null
          compliance_notes?: string | null
          country_code: string
          created_at?: string | null
          description?: string | null
          id?: string
          implementation_deadline?: string | null
          is_mandatory?: boolean | null
          original_table?: string | null
          regulatory_authority?: string | null
          requirement_name: string
          requirement_type: string
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          compliance_cost?: number | null
          compliance_notes?: string | null
          country_code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          implementation_deadline?: string | null
          is_mandatory?: boolean | null
          original_table?: string | null
          regulatory_authority?: string | null
          requirement_name?: string
          requirement_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      regional_payment_methods: {
        Row: {
          country_code: string
          created_at: string | null
          fixed_fee: number | null
          id: string
          is_active: boolean | null
          is_recurring_supported: boolean | null
          maximum_amount: number | null
          method_name: string
          minimum_amount: number | null
          payment_method: string
          processing_fee_percent: number | null
          requires_encryption: boolean | null
          settlement_time_days: number | null
          supports_3ds: boolean | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          country_code: string
          created_at?: string | null
          fixed_fee?: number | null
          id?: string
          is_active?: boolean | null
          is_recurring_supported?: boolean | null
          maximum_amount?: number | null
          method_name: string
          minimum_amount?: number | null
          payment_method: string
          processing_fee_percent?: number | null
          requires_encryption?: boolean | null
          settlement_time_days?: number | null
          supports_3ds?: boolean | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          country_code?: string
          created_at?: string | null
          fixed_fee?: number | null
          id?: string
          is_active?: boolean | null
          is_recurring_supported?: boolean | null
          maximum_amount?: number | null
          method_name?: string
          minimum_amount?: number | null
          payment_method?: string
          processing_fee_percent?: number | null
          requires_encryption?: boolean | null
          settlement_time_days?: number | null
          supports_3ds?: boolean | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      regional_performance: {
        Row: {
          baseline_value: number | null
          country_code: string
          created_at: string | null
          data_source: string | null
          id: string
          metric_name: string
          metric_value: number | null
          performance_ratio: number | null
          period_end: string | null
          period_start: string | null
        }
        Insert: {
          baseline_value?: number | null
          country_code: string
          created_at?: string | null
          data_source?: string | null
          id?: string
          metric_name: string
          metric_value?: number | null
          performance_ratio?: number | null
          period_end?: string | null
          period_start?: string | null
        }
        Update: {
          baseline_value?: number | null
          country_code?: string
          created_at?: string | null
          data_source?: string | null
          id?: string
          metric_name?: string
          metric_value?: number | null
          performance_ratio?: number | null
          period_end?: string | null
          period_start?: string | null
        }
        Relationships: []
      }
      regional_plan_features: {
        Row: {
          country_code: string
          created_at: string | null
          customization_notes: string | null
          feature_description: string | null
          feature_key: string
          feature_name: string
          id: string
          is_available: boolean | null
          plan_id: string | null
          regional_restriction: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          country_code: string
          created_at?: string | null
          customization_notes?: string | null
          feature_description?: string | null
          feature_key: string
          feature_name: string
          id?: string
          is_available?: boolean | null
          plan_id?: string | null
          regional_restriction?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          country_code?: string
          created_at?: string | null
          customization_notes?: string | null
          feature_description?: string | null
          feature_key?: string
          feature_name?: string
          id?: string
          is_available?: boolean | null
          plan_id?: string | null
          regional_restriction?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      regional_plan_pricing: {
        Row: {
          country_code: string
          created_at: string | null
          currency_code: string
          effective_date: string | null
          expiry_date: string | null
          id: string
          is_active: boolean | null
          plan_id: string | null
          price_monthly: number
          price_yearly: number
          pricing_strategy: string | null
          purchasing_power_parity: number | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          country_code: string
          created_at?: string | null
          currency_code: string
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          plan_id?: string | null
          price_monthly: number
          price_yearly: number
          pricing_strategy?: string | null
          purchasing_power_parity?: number | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          country_code?: string
          created_at?: string | null
          currency_code?: string
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          plan_id?: string | null
          price_monthly?: number
          price_yearly?: number
          pricing_strategy?: string | null
          purchasing_power_parity?: number | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reservations: {
        Row: {
          cancelled_at: string | null
          combination_id: string | null
          confirmation_code: string
          confirmed_at: string | null
          contact_info: Json | null
          created_at: string | null
          estimated_duration: string | null
          guest_count: number
          id: string
          party_size: number | null
          payment_status: string | null
          reservation_date: string
          reservation_time: string
          restaurant_id: string | null
          restaurant_location_id: string | null
          schedule_id: string | null
          seated_at: string | null
          special_requests: string | null
          staff_id: string | null
          status: string | null
          table_id: string | null
          total_amount: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cancelled_at?: string | null
          combination_id?: string | null
          confirmation_code?: string
          confirmed_at?: string | null
          contact_info?: Json | null
          created_at?: string | null
          estimated_duration?: string | null
          guest_count: number
          id?: string
          party_size?: number | null
          payment_status?: string | null
          reservation_date: string
          reservation_time: string
          restaurant_id?: string | null
          restaurant_location_id?: string | null
          schedule_id?: string | null
          seated_at?: string | null
          special_requests?: string | null
          staff_id?: string | null
          status?: string | null
          table_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cancelled_at?: string | null
          combination_id?: string | null
          confirmation_code?: string
          confirmed_at?: string | null
          contact_info?: Json | null
          created_at?: string | null
          estimated_duration?: string | null
          guest_count?: number
          id?: string
          party_size?: number | null
          payment_status?: string | null
          reservation_date?: string
          reservation_time?: string
          restaurant_id?: string | null
          restaurant_location_id?: string | null
          schedule_id?: string | null
          seated_at?: string | null
          special_requests?: string | null
          staff_id?: string | null
          status?: string | null
          table_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_reservations_combination"
            columns: ["combination_id"]
            isOneToOne: false
            referencedRelation: "table_combinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reservations_location"
            columns: ["restaurant_location_id"]
            isOneToOne: false
            referencedRelation: "restaurant_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reservations_location"
            columns: ["restaurant_location_id"]
            isOneToOne: false
            referencedRelation: "v_restaurant_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reservations_location"
            columns: ["restaurant_location_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["primary_location_id"]
          },
          {
            foreignKeyName: "fk_reservations_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "fk_reservations_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reservations_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reservations_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reservations_table"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reservations_user_profile"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "staff_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_appearance_settings: {
        Row: {
          created_at: string | null
          id: string
          restaurant_id: string
          theme: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          restaurant_id: string
          theme?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          restaurant_id?: string
          theme?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      restaurant_customization_preferences: {
        Row: {
          created_at: string | null
          id: string
          preferences: Json | null
          restaurant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          preferences?: Json | null
          restaurant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          preferences?: Json | null
          restaurant_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      restaurant_gallery: {
        Row: {
          caption: string | null
          category: string | null
          created_at: string
          id: string
          restaurant_id: string | null
          url: string
        }
        Insert: {
          caption?: string | null
          category?: string | null
          created_at?: string
          id?: string
          restaurant_id?: string | null
          url: string
        }
        Update: {
          caption?: string | null
          category?: string | null
          created_at?: string
          id?: string
          restaurant_id?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_gallery_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "restaurant_gallery_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_gallery_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_gallery_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_locations: {
        Row: {
          address: Json
          booking_settings: Json | null
          city: string | null
          contact_info: Json | null
          coordinates: unknown
          country: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_main_location: boolean | null
          is_primary: boolean | null
          latitude: number | null
          location_name: string | null
          longitude: number | null
          manager_id: string | null
          opening_hours: Json | null
          operating_hours: Json | null
          owner_id: string | null
          phone: string | null
          phone_number: string | null
          restaurant_id: string | null
          state: string | null
          timezone: string | null
          updated_at: string | null
          zip: string | null
          zip_code: string | null
        }
        Insert: {
          address: Json
          booking_settings?: Json | null
          city?: string | null
          contact_info?: Json | null
          coordinates?: unknown
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_main_location?: boolean | null
          is_primary?: boolean | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          manager_id?: string | null
          opening_hours?: Json | null
          operating_hours?: Json | null
          owner_id?: string | null
          phone?: string | null
          phone_number?: string | null
          restaurant_id?: string | null
          state?: string | null
          timezone?: string | null
          updated_at?: string | null
          zip?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: Json
          booking_settings?: Json | null
          city?: string | null
          contact_info?: Json | null
          coordinates?: unknown
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_main_location?: boolean | null
          is_primary?: boolean | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          manager_id?: string | null
          opening_hours?: Json | null
          operating_hours?: Json | null
          owner_id?: string | null
          phone?: string | null
          phone_number?: string | null
          restaurant_id?: string | null
          state?: string | null
          timezone?: string | null
          updated_at?: string | null
          zip?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_locations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "restaurant_locations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_locations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_locations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_partners: {
        Row: {
          address: Json | null
          business_email: string
          business_license: string | null
          business_name: string
          business_phone: string | null
          contact_name: string | null
          created_at: string | null
          id: string
          onboarding_completed: boolean | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_end_date: string | null
          subscription_plan_id: string | null
          subscription_start_date: string | null
          subscription_status: string | null
          tax_id: string | null
          trial_end_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: Json | null
          business_email: string
          business_license?: string | null
          business_name: string
          business_phone?: string | null
          contact_name?: string | null
          created_at?: string | null
          id?: string
          onboarding_completed?: boolean | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_plan_id?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          tax_id?: string | null
          trial_end_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: Json | null
          business_email?: string
          business_license?: string | null
          business_name?: string
          business_phone?: string | null
          contact_name?: string | null
          created_at?: string | null
          id?: string
          onboarding_completed?: boolean | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_plan_id?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          tax_id?: string | null
          trial_end_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_partners_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_settings: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          plan_required: string | null
          restaurant_id: string | null
          setting_key: string
          setting_value: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          plan_required?: string | null
          restaurant_id?: string | null
          setting_key: string
          setting_value?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          plan_required?: string | null
          restaurant_id?: string | null
          setting_key?: string
          setting_value?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_settings_plan_required_fkey"
            columns: ["plan_required"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_settings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "restaurant_settings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_settings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_settings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_staff: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          restaurant_id: string
          restaurant_location_id: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          restaurant_id: string
          restaurant_location_id?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          restaurant_id?: string
          restaurant_location_id?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_staff_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "restaurant_staff_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_staff_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_staff_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_staff_restaurant_location_id_fkey"
            columns: ["restaurant_location_id"]
            isOneToOne: false
            referencedRelation: "restaurant_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_staff_restaurant_location_id_fkey"
            columns: ["restaurant_location_id"]
            isOneToOne: false
            referencedRelation: "v_restaurant_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_staff_restaurant_location_id_fkey"
            columns: ["restaurant_location_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["primary_location_id"]
          },
          {
            foreignKeyName: "restaurant_staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_waitlist_settings: {
        Row: {
          created_at: string | null
          id: string
          max_party_size: number | null
          notify_staff: boolean | null
          restaurant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          max_party_size?: number | null
          notify_staff?: boolean | null
          restaurant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          max_party_size?: number | null
          notify_staff?: boolean | null
          restaurant_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          address: Json | null
          address_json: Json | null
          admin_id: string | null
          amenities: string[] | null
          auto_confirm_bookings: boolean | null
          available_tables: number | null
          average_meal_duration: string | null
          booking_settings: Json | null
          cancellation_policy: Json | null
          capacity: number | null
          contact_info: Json | null
          country_code: string | null
          created_at: string | null
          cuisine: string | null
          cuisine_type: string | null
          cuisine_type_raw: string[] | null
          currency_code: string | null
          current_usage: Json | null
          deposit_required: boolean | null
          description: string | null
          dress_code: string | null
          email: string | null
          features: string | null
          has_advanced_analytics: boolean | null
          has_api_access: boolean | null
          has_custom_branding: boolean | null
          id: string
          image_url: string | null
          images: Json | null
          is_active: boolean | null
          max_capacity: number | null
          name: string
          opening_hours: Json | null
          operating_hours: Json | null
          owner_id: string | null
          parking_info: string | null
          payment_settings: Json | null
          phone: string | null
          plan_features: Json | null
          plan_id: string | null
          price: string | null
          price_range: number | null
          rating: number | null
          rating_avg: number | null
          rating_count: number | null
          region: string | null
          seating_capacity: number | null
          slug: string
          social_media: Json | null
          status: string | null
          subscription_plan: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          address?: Json | null
          address_json?: Json | null
          admin_id?: string | null
          amenities?: string[] | null
          auto_confirm_bookings?: boolean | null
          available_tables?: number | null
          average_meal_duration?: string | null
          booking_settings?: Json | null
          cancellation_policy?: Json | null
          capacity?: number | null
          contact_info?: Json | null
          country_code?: string | null
          created_at?: string | null
          cuisine?: string | null
          cuisine_type?: string | null
          cuisine_type_raw?: string[] | null
          currency_code?: string | null
          current_usage?: Json | null
          deposit_required?: boolean | null
          description?: string | null
          dress_code?: string | null
          email?: string | null
          features?: string | null
          has_advanced_analytics?: boolean | null
          has_api_access?: boolean | null
          has_custom_branding?: boolean | null
          id?: string
          image_url?: string | null
          images?: Json | null
          is_active?: boolean | null
          max_capacity?: number | null
          name: string
          opening_hours?: Json | null
          operating_hours?: Json | null
          owner_id?: string | null
          parking_info?: string | null
          payment_settings?: Json | null
          phone?: string | null
          plan_features?: Json | null
          plan_id?: string | null
          price?: string | null
          price_range?: number | null
          rating?: number | null
          rating_avg?: number | null
          rating_count?: number | null
          region?: string | null
          seating_capacity?: number | null
          slug: string
          social_media?: Json | null
          status?: string | null
          subscription_plan?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          address?: Json | null
          address_json?: Json | null
          admin_id?: string | null
          amenities?: string[] | null
          auto_confirm_bookings?: boolean | null
          available_tables?: number | null
          average_meal_duration?: string | null
          booking_settings?: Json | null
          cancellation_policy?: Json | null
          capacity?: number | null
          contact_info?: Json | null
          country_code?: string | null
          created_at?: string | null
          cuisine?: string | null
          cuisine_type?: string | null
          cuisine_type_raw?: string[] | null
          currency_code?: string | null
          current_usage?: Json | null
          deposit_required?: boolean | null
          description?: string | null
          dress_code?: string | null
          email?: string | null
          features?: string | null
          has_advanced_analytics?: boolean | null
          has_api_access?: boolean | null
          has_custom_branding?: boolean | null
          id?: string
          image_url?: string | null
          images?: Json | null
          is_active?: boolean | null
          max_capacity?: number | null
          name?: string
          opening_hours?: Json | null
          operating_hours?: Json | null
          owner_id?: string | null
          parking_info?: string | null
          payment_settings?: Json | null
          phone?: string | null
          plan_features?: Json | null
          plan_id?: string | null
          price?: string | null
          price_range?: number | null
          rating?: number | null
          rating_avg?: number | null
          rating_count?: number | null
          region?: string | null
          seating_capacity?: number | null
          slug?: string
          social_media?: Json | null
          status?: string | null
          subscription_plan?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_subscription_plan_fkey"
            columns: ["subscription_plan"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      review_likes: {
        Row: {
          created_at: string
          id: string
          review_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          review_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          review_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_likes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string
          review_id: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          review_id?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          review_id?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_reports_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          content: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          is_verified: boolean | null
          rating: number
          reservation_id: string | null
          restaurant_id: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_verified?: boolean | null
          rating: number
          reservation_id?: string | null
          restaurant_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_verified?: boolean | null
          rating?: number
          reservation_id?: string | null
          restaurant_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_change_audit: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          id: string
          new_role: string | null
          old_role: string | null
          reason: string | null
          user_id: string
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_role?: string | null
          old_role?: string | null
          reason?: string | null
          user_id: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_role?: string | null
          old_role?: string | null
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          permissions: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          is_active?: boolean | null
          name: string
          permissions?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          permissions?: Json | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          country_code: string | null
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          restaurant_id: string | null
          severity: string | null
          user_id: string | null
        }
        Insert: {
          country_code?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          restaurant_id?: string | null
          severity?: string | null
          user_id?: string | null
        }
        Update: {
          country_code?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          restaurant_id?: string | null
          severity?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      shift_types: {
        Row: {
          color: string | null
          created_at: string | null
          end_time: string
          id: string
          name: string
          restaurant_id: string | null
          restaurant_location_id: string | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          end_time: string
          id?: string
          name: string
          restaurant_id?: string | null
          restaurant_location_id?: string | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          end_time?: string
          id?: string
          name?: string
          restaurant_id?: string | null
          restaurant_location_id?: string | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shift_types_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "shift_types_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_types_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_types_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_types_restaurant_location_id_fkey"
            columns: ["restaurant_location_id"]
            isOneToOne: false
            referencedRelation: "restaurant_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_types_restaurant_location_id_fkey"
            columns: ["restaurant_location_id"]
            isOneToOne: false
            referencedRelation: "v_restaurant_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_types_restaurant_location_id_fkey"
            columns: ["restaurant_location_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["primary_location_id"]
          },
        ]
      }
      sms_notifications: {
        Row: {
          cost: number | null
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          id: string
          message: string
          phone_number: string
          provider_message_id: string | null
          sent_at: string | null
          status: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message: string
          phone_number: string
          provider_message_id?: string | null
          sent_at?: string | null
          status?: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message?: string
          phone_number?: string
          provider_message_id?: string | null
          sent_at?: string | null
          status?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      social_media_posts: {
        Row: {
          comments: number | null
          content: string
          created_at: string
          created_by: string | null
          id: string
          image_url: string | null
          likes: number | null
          platform: string
          published_at: string | null
          reach: number | null
          restaurant_id: string
          scheduled_at: string | null
          shares: number | null
          status: string
          updated_at: string
        }
        Insert: {
          comments?: number | null
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          likes?: number | null
          platform: string
          published_at?: string | null
          reach?: number | null
          restaurant_id: string
          scheduled_at?: string | null
          shares?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          comments?: number | null
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          likes?: number | null
          platform?: string
          published_at?: string | null
          reach?: number | null
          restaurant_id?: string
          scheduled_at?: string | null
          shares?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_media_posts_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "social_media_posts_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_media_posts_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_media_posts_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
        ]
      }
      special_event_order_items: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string
          notes: string | null
          quantity: number
          special_event_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id: string
          notes?: string | null
          quantity?: number
          special_event_id: string
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string
          notes?: string | null
          quantity?: number
          special_event_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "special_event_order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "special_event_order_items_special_event_id_fkey"
            columns: ["special_event_id"]
            isOneToOne: false
            referencedRelation: "special_events"
            referencedColumns: ["id"]
          },
        ]
      }
      special_events: {
        Row: {
          created_at: string | null
          description: string | null
          event_date: string | null
          id: string
          internal_notes: string | null
          location_id: string | null
          payload: Json | null
          restaurant_id: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          user_is_admin: boolean | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          id?: string
          internal_notes?: string | null
          location_id?: string | null
          payload?: Json | null
          restaurant_id?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_is_admin?: boolean | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          id?: string
          internal_notes?: string | null
          location_id?: string | null
          payload?: Json | null
          restaurant_id?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_is_admin?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_special_events_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "fk_special_events_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_special_events_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_special_events_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "special_events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "restaurant_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "special_events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "v_restaurant_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "special_events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["primary_location_id"]
          },
          {
            foreignKeyName: "special_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_schedules: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          restaurant_id: string | null
          restaurant_location_id: string | null
          shift_type_id: string | null
          staff_id: string | null
          updated_at: string | null
          work_date: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          restaurant_id?: string | null
          restaurant_location_id?: string | null
          shift_type_id?: string | null
          staff_id?: string | null
          updated_at?: string | null
          work_date: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          restaurant_id?: string | null
          restaurant_location_id?: string | null
          shift_type_id?: string | null
          staff_id?: string | null
          updated_at?: string | null
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_schedules_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "staff_schedules_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_schedules_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_schedules_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_schedules_restaurant_location_id_fkey"
            columns: ["restaurant_location_id"]
            isOneToOne: false
            referencedRelation: "restaurant_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_schedules_restaurant_location_id_fkey"
            columns: ["restaurant_location_id"]
            isOneToOne: false
            referencedRelation: "v_restaurant_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_schedules_restaurant_location_id_fkey"
            columns: ["restaurant_location_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["primary_location_id"]
          },
          {
            foreignKeyName: "staff_schedules_shift_type_id_fkey"
            columns: ["shift_type_id"]
            isOneToOne: false
            referencedRelation: "shift_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_schedules_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "restaurant_staff"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_levels: {
        Row: {
          current_quantity: number
          id: string
          ingredient_id: string
          last_updated: string | null
          location_id: string | null
          restaurant_id: string | null
          unit_cost: number | null
        }
        Insert: {
          current_quantity?: number
          id?: string
          ingredient_id: string
          last_updated?: string | null
          location_id?: string | null
          restaurant_id?: string | null
          unit_cost?: number | null
        }
        Update: {
          current_quantity?: number
          id?: string
          ingredient_id?: string
          last_updated?: string | null
          location_id?: string | null
          restaurant_id?: string | null
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_levels_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_levels_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "stock_levels_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_levels_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_levels_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transactions: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          ingredient_id: string
          notes: string | null
          quantity_change: number
          restaurant_id: string | null
          stock_level_id: string | null
          transaction_type: string
          unit_cost: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          ingredient_id: string
          notes?: string | null
          quantity_change: number
          restaurant_id?: string | null
          stock_level_id?: string | null
          transaction_type: string
          unit_cost?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          ingredient_id?: string
          notes?: string | null
          quantity_change?: number
          restaurant_id?: string | null
          stock_level_id?: string | null
          transaction_type?: string
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transactions_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transactions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "stock_transactions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transactions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transactions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transactions_stock_level_id_fkey"
            columns: ["stock_level_id"]
            isOneToOne: false
            referencedRelation: "stock_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_features: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          analytics_level: string | null
          api_access: boolean | null
          billing_cycle: string | null
          created_at: string | null
          custom_branding: boolean | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          max_customers: number | null
          max_locations: number | null
          max_staff: number | null
          name: string
          plan_key: string | null
          plan_tier: string | null
          price_monthly: number
          price_yearly: number | null
          regional_tier_strategy: string | null
          sort_order: number | null
          support_level: string | null
          supports_regional_pricing: boolean | null
          trial_days: number | null
          trial_period_days: number | null
          updated_at: string | null
          white_label: boolean | null
        }
        Insert: {
          analytics_level?: string | null
          api_access?: boolean | null
          billing_cycle?: string | null
          created_at?: string | null
          custom_branding?: boolean | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          max_customers?: number | null
          max_locations?: number | null
          max_staff?: number | null
          name: string
          plan_key?: string | null
          plan_tier?: string | null
          price_monthly: number
          price_yearly?: number | null
          regional_tier_strategy?: string | null
          sort_order?: number | null
          support_level?: string | null
          supports_regional_pricing?: boolean | null
          trial_days?: number | null
          trial_period_days?: number | null
          updated_at?: string | null
          white_label?: boolean | null
        }
        Update: {
          analytics_level?: string | null
          api_access?: boolean | null
          billing_cycle?: string | null
          created_at?: string | null
          custom_branding?: boolean | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          max_customers?: number | null
          max_locations?: number | null
          max_staff?: number | null
          name?: string
          plan_key?: string | null
          plan_tier?: string | null
          price_monthly?: number
          price_yearly?: number | null
          regional_tier_strategy?: string | null
          sort_order?: number | null
          support_level?: string | null
          supports_regional_pricing?: boolean | null
          trial_days?: number | null
          trial_period_days?: number | null
          updated_at?: string | null
          white_label?: boolean | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      table_availability_status: {
        Row: {
          reservation_date: string
          reservation_id: string | null
          reservation_time: string
          status: string | null
          table_id: string | null
        }
        Insert: {
          reservation_date: string
          reservation_id?: string | null
          reservation_time: string
          status?: string | null
          table_id?: string | null
        }
        Update: {
          reservation_date?: string
          reservation_id?: string | null
          reservation_time?: string
          status?: string | null
          table_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "table_availability_status_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_availability_status_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      table_combinations: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean
          is_preferred: boolean
          max_party_size: number | null
          min_party_size: number | null
          name: string
          priority: number
          restaurant_id: string | null
          restaurant_location_id: string | null
          table_a_id: string | null
          table_b_id: string | null
          table_ids: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean
          is_preferred?: boolean
          max_party_size?: number | null
          min_party_size?: number | null
          name: string
          priority?: number
          restaurant_id?: string | null
          restaurant_location_id?: string | null
          table_a_id?: string | null
          table_b_id?: string | null
          table_ids?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean
          is_preferred?: boolean
          max_party_size?: number | null
          min_party_size?: number | null
          name?: string
          priority?: number
          restaurant_id?: string | null
          restaurant_location_id?: string | null
          table_a_id?: string | null
          table_b_id?: string | null
          table_ids?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "table_combinations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "table_combinations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_combinations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_combinations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_combinations_restaurant_location_id_fkey"
            columns: ["restaurant_location_id"]
            isOneToOne: false
            referencedRelation: "restaurant_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_combinations_restaurant_location_id_fkey"
            columns: ["restaurant_location_id"]
            isOneToOne: false
            referencedRelation: "v_restaurant_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_combinations_restaurant_location_id_fkey"
            columns: ["restaurant_location_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["primary_location_id"]
          },
          {
            foreignKeyName: "table_combinations_table_a_id_fkey"
            columns: ["table_a_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_combinations_table_b_id_fkey"
            columns: ["table_b_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      table_sections: {
        Row: {
          id: string
          name: string
          restaurant_location_id: string | null
          sort_order: number | null
        }
        Insert: {
          id?: string
          name: string
          restaurant_location_id?: string | null
          sort_order?: number | null
        }
        Update: {
          id?: string
          name?: string
          restaurant_location_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "table_sections_restaurant_location_id_fkey"
            columns: ["restaurant_location_id"]
            isOneToOne: false
            referencedRelation: "restaurant_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_sections_restaurant_location_id_fkey"
            columns: ["restaurant_location_id"]
            isOneToOne: false
            referencedRelation: "v_restaurant_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_sections_restaurant_location_id_fkey"
            columns: ["restaurant_location_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["primary_location_id"]
          },
        ]
      }
      table_status_history: {
        Row: {
          change_reason: string | null
          changed_at: string | null
          changed_by: string | null
          new_status: string | null
          old_status: string | null
          table_id: string | null
        }
        Insert: {
          change_reason?: string | null
          changed_at?: string | null
          changed_by?: string | null
          new_status?: string | null
          old_status?: string | null
          table_id?: string | null
        }
        Update: {
          change_reason?: string | null
          changed_at?: string | null
          changed_by?: string | null
          new_status?: string | null
          old_status?: string | null
          table_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "table_status_history_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      tables: {
        Row: {
          capacity: number
          created_at: string | null
          id: string
          is_available: boolean | null
          location: string | null
          max_party_size: number | null
          min_party_size: number | null
          restaurant_id: string | null
          restaurant_location_id: string | null
          section: string | null
          table_number: string
        }
        Insert: {
          capacity: number
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          location?: string | null
          max_party_size?: number | null
          min_party_size?: number | null
          restaurant_id?: string | null
          restaurant_location_id?: string | null
          section?: string | null
          table_number: string
        }
        Update: {
          capacity?: number
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          location?: string | null
          max_party_size?: number | null
          min_party_size?: number | null
          restaurant_id?: string | null
          restaurant_location_id?: string | null
          section?: string | null
          table_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "tables_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "tables_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tables_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tables_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tables_restaurant_location_id_fkey"
            columns: ["restaurant_location_id"]
            isOneToOne: false
            referencedRelation: "restaurant_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tables_restaurant_location_id_fkey"
            columns: ["restaurant_location_id"]
            isOneToOne: false
            referencedRelation: "v_restaurant_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tables_restaurant_location_id_fkey"
            columns: ["restaurant_location_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["primary_location_id"]
          },
        ]
      }
      tax_rates: {
        Row: {
          applies_to: string[]
          compliance_notes: string | null
          country_code: string
          created_at: string | null
          effective_date: string
          id: string
          is_inclusive: boolean
          rate_percent: number
          region: string | null
          tax_name: string
          tax_type: string
          updated_at: string | null
        }
        Insert: {
          applies_to: string[]
          compliance_notes?: string | null
          country_code: string
          created_at?: string | null
          effective_date: string
          id?: string
          is_inclusive: boolean
          rate_percent: number
          region?: string | null
          tax_name: string
          tax_type: string
          updated_at?: string | null
        }
        Update: {
          applies_to?: string[]
          compliance_notes?: string | null
          country_code?: string
          created_at?: string | null
          effective_date?: string
          id?: string
          is_inclusive?: boolean
          rate_percent?: number
          region?: string | null
          tax_name?: string
          tax_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tenant_isolation_settings: {
        Row: {
          cache_namespace_isolation: boolean | null
          connection_pool_isolation: boolean | null
          created_at: string | null
          cross_tenant_performance_tracking: boolean | null
          database_schema_isolation: boolean | null
          dedicated_cpu_cores: number | null
          dedicated_memory_gb: number | null
          dedicated_storage_gb: number | null
          id: string
          is_active: boolean | null
          isolation_monitoring_enabled: boolean | null
          max_cross_tenant_impact_percentage: number | null
          min_response_time_ms: number | null
          min_uptime_percentage: number | null
          network_bandwidth_limit_mbps: number | null
          queue_isolation: boolean | null
          restaurant_id: string | null
          tenant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cache_namespace_isolation?: boolean | null
          connection_pool_isolation?: boolean | null
          created_at?: string | null
          cross_tenant_performance_tracking?: boolean | null
          database_schema_isolation?: boolean | null
          dedicated_cpu_cores?: number | null
          dedicated_memory_gb?: number | null
          dedicated_storage_gb?: number | null
          id?: string
          is_active?: boolean | null
          isolation_monitoring_enabled?: boolean | null
          max_cross_tenant_impact_percentage?: number | null
          min_response_time_ms?: number | null
          min_uptime_percentage?: number | null
          network_bandwidth_limit_mbps?: number | null
          queue_isolation?: boolean | null
          restaurant_id?: string | null
          tenant_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cache_namespace_isolation?: boolean | null
          connection_pool_isolation?: boolean | null
          created_at?: string | null
          cross_tenant_performance_tracking?: boolean | null
          database_schema_isolation?: boolean | null
          dedicated_cpu_cores?: number | null
          dedicated_memory_gb?: number | null
          dedicated_storage_gb?: number | null
          id?: string
          is_active?: boolean | null
          isolation_monitoring_enabled?: boolean | null
          max_cross_tenant_impact_percentage?: number | null
          min_response_time_ms?: number | null
          min_uptime_percentage?: number | null
          network_bandwidth_limit_mbps?: number | null
          queue_isolation?: boolean | null
          restaurant_id?: string | null
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tenant_resource_quotas: {
        Row: {
          alert_thresholds: Json | null
          api_concurrent_requests: number | null
          api_requests_per_minute: number | null
          api_response_time_limit_ms: number | null
          cache_key_limit: number | null
          cache_memory_limit_mb: number | null
          cache_ttl_seconds: number | null
          created_at: string | null
          cross_tenant_impact_limit: number | null
          db_connection_limit: number | null
          db_cpu_share_percentage: number | null
          db_memory_limit_mb: number | null
          db_query_timeout_seconds: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          monitoring_enabled: boolean | null
          plan_id: string
          priority_level: number | null
          queue_size_limit: number | null
          resource_isolation_enabled: boolean | null
          restaurant_id: string | null
          tenant_id: string
          traffic_priority: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_thresholds?: Json | null
          api_concurrent_requests?: number | null
          api_requests_per_minute?: number | null
          api_response_time_limit_ms?: number | null
          cache_key_limit?: number | null
          cache_memory_limit_mb?: number | null
          cache_ttl_seconds?: number | null
          created_at?: string | null
          cross_tenant_impact_limit?: number | null
          db_connection_limit?: number | null
          db_cpu_share_percentage?: number | null
          db_memory_limit_mb?: number | null
          db_query_timeout_seconds?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          monitoring_enabled?: boolean | null
          plan_id: string
          priority_level?: number | null
          queue_size_limit?: number | null
          resource_isolation_enabled?: boolean | null
          restaurant_id?: string | null
          tenant_id: string
          traffic_priority?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_thresholds?: Json | null
          api_concurrent_requests?: number | null
          api_requests_per_minute?: number | null
          api_response_time_limit_ms?: number | null
          cache_key_limit?: number | null
          cache_memory_limit_mb?: number | null
          cache_ttl_seconds?: number | null
          created_at?: string | null
          cross_tenant_impact_limit?: number | null
          db_connection_limit?: number | null
          db_cpu_share_percentage?: number | null
          db_memory_limit_mb?: number | null
          db_query_timeout_seconds?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          monitoring_enabled?: boolean | null
          plan_id?: string
          priority_level?: number | null
          queue_size_limit?: number | null
          resource_isolation_enabled?: boolean | null
          restaurant_id?: string | null
          tenant_id?: string
          traffic_priority?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_resource_quotas_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_resource_usage: {
        Row: {
          average_response_time_ms: number | null
          capacity_warnings: Json | null
          current_api_requests_per_minute: number | null
          current_cache_usage_mb: number | null
          current_db_connections: number | null
          current_queue_size: number | null
          error_rate_percentage: number | null
          hour_period_end: string
          hour_period_start: string
          id: string
          over_limit_alerts: Json | null
          peak_api_requests_per_minute: number | null
          peak_cache_usage_mb: number | null
          peak_db_connections: number | null
          peak_queue_size: number | null
          peak_response_time_ms: number | null
          performance_alerts: Json | null
          quota_id: string
          recorded_at: string | null
          restaurant_id: string | null
          tenant_id: string
          uptime_percentage: number | null
          user_id: string
        }
        Insert: {
          average_response_time_ms?: number | null
          capacity_warnings?: Json | null
          current_api_requests_per_minute?: number | null
          current_cache_usage_mb?: number | null
          current_db_connections?: number | null
          current_queue_size?: number | null
          error_rate_percentage?: number | null
          hour_period_end: string
          hour_period_start: string
          id?: string
          over_limit_alerts?: Json | null
          peak_api_requests_per_minute?: number | null
          peak_cache_usage_mb?: number | null
          peak_db_connections?: number | null
          peak_queue_size?: number | null
          peak_response_time_ms?: number | null
          performance_alerts?: Json | null
          quota_id: string
          recorded_at?: string | null
          restaurant_id?: string | null
          tenant_id: string
          uptime_percentage?: number | null
          user_id: string
        }
        Update: {
          average_response_time_ms?: number | null
          capacity_warnings?: Json | null
          current_api_requests_per_minute?: number | null
          current_cache_usage_mb?: number | null
          current_db_connections?: number | null
          current_queue_size?: number | null
          error_rate_percentage?: number | null
          hour_period_end?: string
          hour_period_start?: string
          id?: string
          over_limit_alerts?: Json | null
          peak_api_requests_per_minute?: number | null
          peak_cache_usage_mb?: number | null
          peak_db_connections?: number | null
          peak_queue_size?: number | null
          peak_response_time_ms?: number | null
          performance_alerts?: Json | null
          quota_id?: string
          recorded_at?: string | null
          restaurant_id?: string | null
          tenant_id?: string
          uptime_percentage?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_resource_usage_quota_id_fkey"
            columns: ["quota_id"]
            isOneToOne: false
            referencedRelation: "tenant_resource_quotas"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_analytics: {
        Row: {
          country_code: string | null
          created_at: string | null
          id: string
          metric_name: string | null
          metric_value: number | null
          period_end: string | null
          period_start: string | null
          restaurant_id: string | null
        }
        Insert: {
          country_code?: string | null
          created_at?: string | null
          id?: string
          metric_name?: string | null
          metric_value?: number | null
          period_end?: string | null
          period_start?: string | null
          restaurant_id?: string | null
        }
        Update: {
          country_code?: string | null
          created_at?: string | null
          id?: string
          metric_name?: string | null
          metric_value?: number | null
          period_end?: string | null
          period_start?: string | null
          restaurant_id?: string | null
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          menu_item_id: string | null
          restaurant_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          restaurant_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          restaurant_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "user_favorites_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          id: string
          restaurant_id: string | null
          role: string | null
          role_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          restaurant_id?: string | null
          role?: string | null
          role_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          restaurant_id?: string | null
          role?: string | null
          role_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_roles_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "fk_user_roles_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_roles_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_roles_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          id: string
          join_time: string | null
          notes: string | null
          notification_sent: boolean | null
          party_size: number
          phone_number: string | null
          quoted_wait_time: number | null
          reservation_id: string | null
          restaurant_id: string | null
          seated_time: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          id?: string
          join_time?: string | null
          notes?: string | null
          notification_sent?: boolean | null
          party_size: number
          phone_number?: string | null
          quoted_wait_time?: number | null
          reservation_id?: string | null
          restaurant_id?: string | null
          seated_time?: string | null
          status: string
          user_id?: string | null
        }
        Update: {
          id?: string
          join_time?: string | null
          notes?: string | null
          notification_sent?: boolean | null
          party_size?: number
          phone_number?: string | null
          quoted_wait_time?: number | null
          reservation_id?: string | null
          restaurant_id?: string | null
          seated_time?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "waitlist_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist_audit: {
        Row: {
          change_type: string
          changed_at: string | null
          changed_by: string | null
          entry_id: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
        }
        Insert: {
          change_type: string
          changed_at?: string | null
          changed_by?: string | null
          entry_id?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
        }
        Update: {
          change_type?: string
          changed_at?: string | null
          changed_by?: string | null
          entry_id?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_waitlist_audit_entry"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "waitlist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_audit_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "waitlist"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      capacity_status_view: {
        Row: {
          admin_id: string | null
          base_capacity: number | null
          buffer_percentage: number | null
          capacity_status: string | null
          country_code: string | null
          current_reservations: number | null
          dynamic_capacity: number | null
          overbooking_percentage: number | null
          region: string | null
          restaurant_id: string | null
          restaurant_name: string | null
          utilization_percentage: number | null
        }
        Insert: {
          admin_id?: string | null
          base_capacity?: number | null
          buffer_percentage?: never
          capacity_status?: never
          country_code?: string | null
          current_reservations?: never
          dynamic_capacity?: number | null
          overbooking_percentage?: never
          region?: string | null
          restaurant_id?: string | null
          restaurant_name?: string | null
          utilization_percentage?: never
        }
        Update: {
          admin_id?: string | null
          base_capacity?: number | null
          buffer_percentage?: never
          capacity_status?: never
          country_code?: string | null
          current_reservations?: never
          dynamic_capacity?: number | null
          overbooking_percentage?: never
          region?: string | null
          restaurant_id?: string | null
          restaurant_name?: string | null
          utilization_percentage?: never
        }
        Relationships: []
      }
      user_roles_unified: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string | null
          is_active: boolean | null
          last_login: string | null
          last_name: string | null
          restaurant_id: string | null
          role: string | null
          role_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_roles_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "fk_user_roles_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_roles_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_roles_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles_with_customer: {
        Row: {
          assigned_by: string | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          restaurant_id: string | null
          role: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_roles_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "fk_user_roles_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_roles_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_roles_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      v_restaurant_locations: {
        Row: {
          address: Json | null
          contact_info: Json | null
          coordinates: unknown
          created_at: string | null
          id: string | null
          is_primary: boolean | null
          owner_id: string | null
          restaurant: Json | null
          restaurant_id: string | null
          timezone: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_locations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "capacity_status_view"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "restaurant_locations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_locations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_locations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_location"
            referencedColumns: ["id"]
          },
        ]
      }
      v_restaurants: {
        Row: {
          address: Json | null
          address_json: Json | null
          admin_id: string | null
          amenities: string[] | null
          auto_confirm_bookings: boolean | null
          available_tables: number | null
          average_meal_duration: string | null
          booking_settings: Json | null
          cancellation_policy: Json | null
          capacity: number | null
          contact_info: Json | null
          country_code: string | null
          created_at: string | null
          cuisine: string | null
          cuisine_type: string | null
          cuisine_type_raw: string[] | null
          currency_code: string | null
          current_usage: Json | null
          customer_id: string | null
          deposit_required: boolean | null
          description: string | null
          dress_code: string | null
          email: string | null
          features: string | null
          has_advanced_analytics: boolean | null
          has_api_access: boolean | null
          has_custom_branding: boolean | null
          id: string | null
          image_url: string | null
          images: Json | null
          is_active: boolean | null
          max_capacity: number | null
          name: string | null
          opening_hours: Json | null
          operating_hours: Json | null
          parking_info: string | null
          payment_settings: Json | null
          phone: string | null
          plan_features: Json | null
          plan_id: string | null
          price: string | null
          price_range: number | null
          primary_location_id: string | null
          rating: number | null
          rating_avg: number | null
          rating_count: number | null
          region: string | null
          seating_capacity: number | null
          slug: string | null
          social_media: Json | null
          subscription_plan: string | null
          timezone: string | null
          updated_at: string | null
          website: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_subscription_plan_fkey"
            columns: ["subscription_plan"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      v_restaurants_with_location: {
        Row: {
          address: Json | null
          address_json: Json | null
          admin_id: string | null
          amenities: string[] | null
          auto_confirm_bookings: boolean | null
          available_tables: number | null
          average_meal_duration: string | null
          booking_settings: Json | null
          cancellation_policy: Json | null
          capacity: number | null
          contact_info: Json | null
          country_code: string | null
          created_at: string | null
          cuisine: string | null
          cuisine_type: string | null
          cuisine_type_raw: string[] | null
          currency_code: string | null
          current_usage: Json | null
          customer_id: string | null
          deposit_required: boolean | null
          description: string | null
          dress_code: string | null
          email: string | null
          features: string | null
          has_advanced_analytics: boolean | null
          has_api_access: boolean | null
          has_custom_branding: boolean | null
          id: string | null
          image_url: string | null
          images: Json | null
          is_active: boolean | null
          max_capacity: number | null
          name: string | null
          opening_hours: Json | null
          operating_hours: Json | null
          parking_info: string | null
          payment_settings: Json | null
          phone: string | null
          plan_features: Json | null
          plan_id: string | null
          price: string | null
          price_range: number | null
          primary_location: Json | null
          rating: number | null
          rating_avg: number | null
          rating_count: number | null
          region: string | null
          seating_capacity: number | null
          slug: string | null
          social_media: Json | null
          subscription_plan: string | null
          timezone: string | null
          updated_at: string | null
          website: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_subscription_plan_fkey"
            columns: ["subscription_plan"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_user_role: {
        Args: { p_assigned_by: string; p_role_name: string; p_user_id: string }
        Returns: undefined
      }
      apply_search_path_security: {
        Args: { function_name: string; function_schema?: string }
        Returns: boolean
      }
      audit_booking_changes: {
        Args: {
          p_booking_id: string
          p_change_type: string
          p_changed_by: string
          p_new_data: Json
          p_old_data: Json
        }
        Returns: undefined
      }
      authorize:
        | { Args: never; Returns: boolean }
        | { Args: { requested_permission: string }; Returns: boolean }
      auto_confirm_booking: {
        Args: { p_booking_id: string }
        Returns: undefined
      }
      award_loyalty_points: {
        Args: {
          p_description?: string
          p_points: number
          p_restaurant_id?: string
          p_user_id: string
        }
        Returns: undefined
      }
      calculate_dynamic_capacity: {
        Args: { restaurant_id_param: string; target_time: string }
        Returns: number
      }
      calculate_dynamic_capacity_wrapper: {
        Args: { restaurant_id_param: string; target_time: string }
        Returns: number
      }
      calculate_restaurant_rating: {
        Args: { p_restaurant_id: string }
        Returns: number
      }
      can_access_restaurant: {
        Args: { _restaurant_id: string; _user_id: string }
        Returns: boolean
      }
      can_access_restaurant_wrapper: {
        Args: { p_restaurant_id: string; p_user_id: string }
        Returns: boolean
      }
      can_manage_restaurant: {
        Args: { _restaurant_id: string; _user_id: string }
        Returns: boolean
      }
      can_manage_restaurant_wrapper: {
        Args: { p_restaurant_id: string; p_user_id: string }
        Returns: boolean
      }
      can_manage_role:
        | { Args: never; Returns: boolean }
        | { Args: { target_role: string }; Returns: boolean }
        | {
            Args: { manager_role: string; target_role: string }
            Returns: boolean
          }
        | {
            Args: {
              restaurant_id?: string
              target_role: string
              user_id: string
            }
            Returns: boolean
          }
      can_manage_target_role: {
        Args: { new_role: string; target_customer_id: string }
        Returns: boolean
      }
      can_manage_target_role_impl: {
        Args: { new_role: string; target_user_id: string }
        Returns: boolean
      }
      can_view_all_reservations: { Args: never; Returns: boolean }
      can_view_all_roles: { Args: never; Returns: boolean }
      cancel_overlapping_reservations: {
        Args: {
          b_estimated_duration: string
          b_reservation_date: string
          b_reservation_time: string
          p_booking_id: string
          v_table_ids: string[]
        }
        Returns: undefined
      }
      check_can_manage_user_roles:
        | { Args: { _target_user_id: string }; Returns: boolean }
        | {
            Args: {
              caller_uuid: string
              check_type: string
              target_profile_uuid: string
            }
            Returns: boolean
          }
        | {
            Args: {
              manager_user_id: string
              restaurant_id?: string
              target_user_id: string
            }
            Returns: boolean
          }
      check_password_reset_rate_limit: {
        Args: { user_email: string }
        Returns: boolean
      }
      check_rls_enabled: { Args: { table_name: string }; Returns: boolean }
      check_table_availability:
        | {
            Args: {
              p_duration: string
              p_reservation_date: string
              p_reservation_time: string
              p_restaurant_id: string
              p_table_id: string
            }
            Returns: boolean
          }
        | {
            Args: {
              duration?: string
              party_size: number
              reservation_date: string
              reservation_time: string
              restaurant_id: string
            }
            Returns: {
              capacity: number
              table_id: string
            }[]
          }
      check_tenant_resource_limits: {
        Args: {
          current_usage: number
          resource_type: string
          tenant_id_param: string
        }
        Returns: Json
      }
      cleanup_audit_logs:
        | { Args: never; Returns: number }
        | { Args: { retention_days?: number }; Returns: number }
      cleanup_expired_notifications: { Args: never; Returns: undefined }
      cleanup_expired_password_resets: { Args: never; Returns: undefined }
      confirm_reservation_transactional:
        | {
            Args: {
              p_customer_id: string
              p_location_id: string
              p_party_size: number
              p_reservation_date: string
              p_reservation_time: string
              p_special_requests: string
            }
            Returns: string
          }
        | {
            Args: {
              p_customer_id: string
              p_location_id: string
              p_party_size: number
              p_reservation_date: string
              p_reservation_time: string
              p_special_requests: string
              p_table_id: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_customer_id: string
              p_location_id: string
              p_party_size: number
              p_reservation_date: string
              p_reservation_time: string
              p_special_requests?: string
              p_table_id?: string
            }
            Returns: Json
          }
      create_api_key:
        | {
            Args: {
              p_expires_at?: string
              p_monthly_quota?: number
              p_name: string
            }
            Returns: {
              api_key: string
              key_id: string
            }[]
          }
        | {
            Args: {
              p_expires_at?: string
              p_monthly_quota?: number
              p_name: string
              p_scopes?: string[]
            }
            Returns: {
              api_key: string
              key_id: string
            }[]
          }
      create_api_key_legacy_v1: {
        Args: { expiry_date?: string; key_name: string; quota_limit?: number }
        Returns: {
          id: string
          prefix: string
          secret: string
        }[]
      }
      create_api_key_legacy_v2: {
        Args: {
          p_expires_at?: string
          p_monthly_quota?: number
          p_name: string
          p_scopes?: string[]
        }
        Returns: {
          api_key: string
          key_id: string
        }[]
      }
      create_default_customization_settings: {
        Args: { new_restaurant_id: string }
        Returns: boolean
      }
      create_default_notification_preferences: {
        Args: { p_user_uuid: string }
        Returns: undefined
      }
      create_default_restaurant_settings: {
        Args: { restaurant_id: string }
        Returns: boolean
      }
      create_order_and_consume_stock:
        | {
            Args: {
              p_customer_id: string
              p_items: Json
              p_restaurant_id: string
              p_total_amount: number
            }
            Returns: string
          }
        | {
            Args: {
              p_currency: string
              p_customer_id: string
              p_items: Json
              p_reservation_id: string
              p_restaurant_id: string
            }
            Returns: {
              order_id: string
            }[]
          }
        | {
            Args: {
              p_currency: string
              p_customer_id: string
              p_items: Json
              p_performed_by: string
              p_reservation_id: string
              p_restaurant_id: string
            }
            Returns: {
              order_id: string
            }[]
          }
      create_order_charge_and_finalize: {
        Args: {
          p_charge_amount: number
          p_currency: string
          p_customer_id: string
          p_items: Json
          p_payment_method: string
          p_performed_by: string
          p_reservation_id: string
          p_restaurant_id: string
        }
        Returns: {
          order_id: string
          payment_id: string
        }[]
      }
      create_subscription_secure:
        | {
            Args: {
              p_customer_id: string
              p_plan: string
              p_started_at?: string
            }
            Returns: number
          }
        | {
            Args: {
              billing_cycle_param?: string
              country_code_param: string
              plan_id_param: string
              requesting_user_id?: string
              restaurant_id_param: string
              user_id_param: string
            }
            Returns: Json
          }
      decrement_helpful_count: {
        Args: { review_id: string }
        Returns: undefined
      }
      exec_sql: { Args: { sql_query: string }; Returns: Json }
      find_available_time_slots:
        | {
            Args: {
              p_date: string
              p_party_size: number
              p_restaurant_id: string
            }
            Returns: {
              time_slot: string
            }[]
          }
        | {
            Args: {
              party_size: number
              restaurant_id: string
              search_date: string
            }
            Returns: {
              available_tables: Json
              available_time: string
            }[]
          }
      fix_function_search_path: {
        Args: { function_name: string; function_schema?: string }
        Returns: boolean
      }
      generate_random_key: { Args: { length?: number }; Returns: string }
      generate_secure_regional_data: {
        Args: { country_code_param: string; requesting_user: string }
        Returns: Json
      }
      get_available_roles: {
        Args: never
        Returns: {
          id: number
          role: string
        }[]
      }
      get_available_tables:
        | {
            Args: {
              location_id: string
              party_size: number
              reservation_date: string
              reservation_time: string
            }
            Returns: {
              capacity: number
              id: string
              restaurant_location_id: string
              section: string
              table_number: string
            }[]
          }
        | {
            Args: {
              p_location_id: string
              p_party_size: number
              p_reservation_date: string
              p_reservation_time: string
            }
            Returns: {
              capacity: number
              section: string
              table_id: string
              table_number: string
            }[]
          }
      get_available_tables_enhanced: {
        Args: {
          p_duration_minutes?: number
          p_location_id: string
          p_party_size: number
          p_reservation_date: string
          p_reservation_time: string
        }
        Returns: {
          capacity: number
          combination_id: string
          id: string
          is_preferred: boolean
          section: string
          table_number: string
        }[]
      }
      get_available_tables_enhanced_v2: {
        Args: {
          p_date: string
          p_duration_minutes?: number
          p_party_size: number
          p_preferred_section?: string
          p_restaurant_id: string
          p_time: string
        }
        Returns: {
          combination_id: string
          is_preferred: boolean
          section: string
          table_id: string
          table_number: string
          total_capacity: number
        }[]
      }
      get_current_user_role: { Args: never; Returns: string }
      get_partner_subscription_status: {
        Args: { partner_user_id: string }
        Returns: {
          features: Json
          has_active_subscription: boolean
          plan_name: string
          subscription_status: string
        }[]
      }
      get_public_restaurant_locations: {
        Args: never
        Returns: {
          address: string
          city: string
          created_at: string
          id: string
          operating_hours: Json
          restaurant_id: string
          state: string
          updated_at: string
          zip: string
        }[]
      }
      get_regional_features:
        | {
            Args: { country_code?: string }
            Returns: {
              feature_key: string
              feature_name: string
              is_available: boolean
              restrictions: Json
            }[]
          }
        | {
            Args: { country_code_param: string; plan_id_param: string }
            Returns: {
              customization_notes: string
              feature_description: string
              feature_key: string
              feature_name: string
              is_available: boolean
              regional_restriction: string
            }[]
          }
      get_regional_features_secure:
        | {
            Args: { country_code?: string }
            Returns: {
              compliance_level: string
              feature_key: string
              feature_name: string
              is_available: boolean
              restrictions: Json
            }[]
          }
        | {
            Args: {
              country_code_param: string
              plan_id_param: string
              requesting_user_id?: string
            }
            Returns: {
              customization_notes: string
              feature_description: string
              feature_key: string
              feature_name: string
              is_available: boolean
              priority_level: number
              regional_restriction: string
            }[]
          }
      get_regional_pricing:
        | {
            Args: { country_code?: string }
            Returns: {
              currency: string
              price_multiplier: number
              region: string
              tax_rate: number
            }[]
          }
        | {
            Args: { country_code_param: string; plan_id_param: string }
            Returns: {
              compliance_cost: number
              currency_code: string
              currency_symbol: string
              plan_name: string
              price_monthly: number
              price_yearly: number
              tax_rate: number
            }[]
          }
      get_regional_pricing_secure:
        | {
            Args: { country_code?: string }
            Returns: {
              compliance_notes: string
              currency: string
              price_multiplier: number
              region: string
              tax_rate: number
            }[]
          }
        | {
            Args: {
              country_code_param: string
              plan_id_param: string
              requesting_user_id?: string
            }
            Returns: {
              compliance_cost: number
              currency_code: string
              currency_symbol: string
              effective_date: string
              plan_name: string
              price_monthly: number
              price_yearly: number
              pricing_strategy: string
              tax_rate: number
            }[]
          }
      get_reservation_total_paid: {
        Args: { reservation_uuid: string }
        Returns: number
      }
      get_restaurant_contact_info: {
        Args: { location_id: string }
        Returns: {
          email: string
          phone: string
        }[]
      }
      get_restaurant_customization_data: {
        Args: { restaurant_id: string }
        Returns: Json
      }
      get_restaurant_location_details: {
        Args: { location_id: string }
        Returns: {
          address: string
          city: string
          created_at: string
          email: string
          has_contact_access: boolean
          id: string
          operating_hours: Json
          phone: string
          restaurant_id: string
          state: string
          updated_at: string
          zip: string
        }[]
      }
      get_restaurant_settings: { Args: { rid: string }; Returns: Json }
      get_table_status_realtime: {
        Args: { p_date: string; p_location_id: string }
        Returns: {
          reservation_date: string
          reservation_time: string
          status: string
          table_id: string
        }[]
      }
      get_unread_notification_count: {
        Args: { p_user_uuid: string }
        Returns: number
      }
      get_user_highest_role: { Args: { _user_id: string }; Returns: string }
      get_user_restaurant_roles: {
        Args: { user_uuid: string }
        Returns: {
          restaurant_id: string
          role_id: string
        }[]
      }
      get_user_role:
        | { Args: never; Returns: string }
        | { Args: { target_user_id: string }; Returns: string }
      get_user_role_v2: { Args: { p_user_id?: string }; Returns: string }
      handle_booking_conflicts: {
        Args: { p_booking_id: string }
        Returns: undefined
      }
      has_menu_category_permission: { Args: never; Returns: boolean }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      has_role_group: {
        Args: { _group_name: string; _user_id: string }
        Returns: boolean
      }
      has_role_group_wrapper: {
        Args: { p_group: string; p_user_id: string }
        Returns: boolean
      }
      has_role_level: {
        Args: { _min_level: number; _user_id: string }
        Returns: boolean
      }
      has_role_wrapper: {
        Args: { p_role: string; p_user_id: string }
        Returns: boolean
      }
      increment_helpful_count: {
        Args: { review_id: string }
        Returns: undefined
      }
      initialize_restaurant_defaults: {
        Args: { p_restaurant_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_admin_user:
        | { Args: never; Returns: boolean }
        | { Args: { _user_id: string }; Returns: boolean }
      is_owner: { Args: never; Returns: boolean }
      is_owner_user:
        | { Args: never; Returns: boolean }
        | { Args: { _user_id: string }; Returns: boolean }
      is_reservation_fully_paid: {
        Args: { reservation_uuid: string }
        Returns: boolean
      }
      is_restaurant_admin:
        | { Args: { p_restaurant: string; p_user: string }; Returns: boolean }
        | { Args: { restaurant_id: string }; Returns: boolean }
      is_restaurant_owner:
        | {
            Args: { _restaurant_id: string; _user_id: string }
            Returns: boolean
          }
        | { Args: { target_restaurant_id: string }; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      join_waitlist: {
        Args: {
          p_customer_id: string
          p_name: string
          p_party_size: number
          p_phone: string
          p_restaurant_id: string
          p_special_requests?: string
        }
        Returns: {
          id: string
        }[]
      }
      list_rls_tables: {
        Args: never
        Returns: {
          rls_enabled: boolean
          table_name: string
        }[]
      }
      manage_waitlist:
        | { Args: { p_restaurant_id: string }; Returns: undefined }
        | {
            Args: {
              needed_capacity: number
              restaurant_id: string
              within_minutes?: number
            }
            Returns: {
              customer_id: string
              party_size: number
              wait_duration: number
              waitlist_id: string
            }[]
          }
      mark_notifications_read: {
        Args: { p_user_uuid: string }
        Returns: number
      }
      merge_duplicate_customers: { Args: never; Returns: number }
      normalize_slug: { Args: { input: string }; Returns: string }
      notify_next_party: {
        Args: { p_restaurant_id: string }
        Returns: {
          entry_id: string
        }[]
      }
      notify_restaurant_owner: {
        Args: { msg: string; rid: string }
        Returns: undefined
      }
      optimize_table_assignments: {
        Args: {
          p_location_id: string
          p_party_size: number
          p_preferred_section: string
        }
        Returns: {
          combination_type: string
          efficiency_score: number
          table_ids: string[]
          total_capacity: number
        }[]
      }
      optimize_table_vacuum: {
        Args: { table_name: string }
        Returns: undefined
      }
      process_refund: {
        Args: {
          payment_uuid: string
          refund_amount: number
          refund_reason?: string
        }
        Returns: string
      }
      redeem_loyalty_reward: {
        Args: { p_reward_id: string; p_user_id: string }
        Returns: Json
      }
      remove_user_role: {
        Args: { p_role_name: string; p_user_id: string }
        Returns: undefined
      }
      reset_api_key_monthly_quota: { Args: never; Returns: undefined }
      sanitize_phone_number: { Args: { phone: string }; Returns: string }
      security_status_summary: {
        Args: never
        Returns: {
          remaining_vulnerabilities: number
          secured_functions: number
          security_percentage: number
          status_level: string
          total_functions: number
        }[]
      }
      send_notifications: {
        Args: {
          p_data?: Json
          p_message: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: undefined
      }
      sync_user_role_data: { Args: never; Returns: undefined }
      sync_user_roles: { Args: { p_user_id: string }; Returns: undefined }
      update_notification_status:
        | {
            Args: { new_status: string; notification_id: string }
            Returns: undefined
          }
        | {
            Args: {
              p_error_message?: string
              p_notification_id: string
              p_provider_message_id?: string
              p_status: string
              p_type: string
            }
            Returns: boolean
          }
      update_regional_pricing_secure:
        | {
            Args: {
              country_code: string
              price_multiplier: number
              tax_rate: number
            }
            Returns: boolean
          }
        | {
            Args: {
              country_code_param: string
              new_price_monthly: number
              new_price_yearly: number
              plan_id_param: string
              requesting_user_id?: string
            }
            Returns: boolean
          }
      update_restaurant_appearance_settings:
        | {
            Args: {
              accent_color?: string
              background_color?: string
              is_dark_mode?: boolean
              primary_color?: string
              restaurant_id: string
              secondary_color?: string
              text_color?: string
              theme?: string
            }
            Returns: boolean
          }
        | {
            Args: { restaurant_uuid: string; settings_data: Json }
            Returns: Json
          }
      update_restaurant_waitlist_settings:
        | {
            Args: {
              custom_messages?: Json
              estimated_wait_time_minutes?: number
              is_enabled?: boolean
              max_waitlist_size?: number
              notification_method?: string
              restaurant_id: string
            }
            Returns: boolean
          }
        | {
            Args: { restaurant_uuid: string; settings_data: Json }
            Returns: Json
          }
      update_table_status: {
        Args: {
          p_change_reason: string
          p_changed_by: string
          p_new_status: string
          p_notes: string
          p_reservation_date: string
          p_reservation_id: string
          p_reservation_time: string
          p_table_id: string
        }
        Returns: boolean
      }
      user_can_access_restaurant: {
        Args: { restaurant_uuid: string; user_uuid: string }
        Returns: boolean
      }
      user_has_role:
        | {
            Args: { required_role: string; target_user_id: string }
            Returns: boolean
          }
        | { Args: { role_name: string; user_id: number }; Returns: boolean }
      user_roles:
        | { Args: never; Returns: undefined }
        | { Args: { required_role: string; user_id: string }; Returns: boolean }
      validate_user_permission:
        | {
            Args: {
              permission_key: string
              restaurant_id?: string
              user_id: string
            }
            Returns: boolean
          }
        | { Args: { required_role: string; user_id: string }; Returns: boolean }
    }
    Enums: {
      email_notification_status: "pending" | "sent" | "failed"
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
      email_notification_status: ["pending", "sent", "failed"],
    },
  },
} as const
