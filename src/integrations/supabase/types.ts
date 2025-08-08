export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      agent_commission_levels: {
        Row: {
          agent_id: string
          commission_percentage: number
          created_at: string
          id: string
          level: number
          updated_at: string
        }
        Insert: {
          agent_id: string
          commission_percentage?: number
          created_at?: string
          id?: string
          level: number
          updated_at?: string
        }
        Update: {
          agent_id?: string
          commission_percentage?: number
          created_at?: string
          id?: string
          level?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_commission_levels_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_referrals: {
        Row: {
          agent_id: string
          commission_earned: number | null
          created_at: string
          id: string
          referral_date: string
          referred_user_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          commission_earned?: number | null
          created_at?: string
          id?: string
          referral_date?: string
          referred_user_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          commission_earned?: number | null
          created_at?: string
          id?: string
          referral_date?: string
          referred_user_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_referrals_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      agents: {
        Row: {
          commission_percentage: number
          created_at: string
          id: string
          is_active: boolean
          referral_code: string | null
          referral_count: number
          total_commission: number
          updated_at: string
          user_id: string
        }
        Insert: {
          commission_percentage?: number
          created_at?: string
          id?: string
          is_active?: boolean
          referral_code?: string | null
          referral_count?: number
          total_commission?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          commission_percentage?: number
          created_at?: string
          id?: string
          is_active?: boolean
          referral_code?: string | null
          referral_count?: number
          total_commission?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bank: {
        Row: {
          account_holder: string
          account_number: string
          bank_name: string
          created_at: string
          id: string
          is_active: boolean
          qr_code_url: string | null
          updated_at: string
        }
        Insert: {
          account_holder: string
          account_number: string
          bank_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          qr_code_url?: string | null
          updated_at?: string
        }
        Update: {
          account_holder?: string
          account_number?: string
          bank_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          qr_code_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      games: {
        Row: {
          block_countries: string[] | null
          category: string | null
          created_at: string | null
          game_id: string
          game_provider_id: number | null
          game_type: number | null
          gpid: number
          id: string
          image: string | null
          is_active: boolean | null
          is_enabled: boolean | null
          is_maintain: boolean | null
          is_provider_online: boolean | null
          lines: number | null
          name: string
          new_game_type: number | null
          provider: string | null
          rank: number | null
          reels: number | null
          rows: number | null
          rtp: number | null
          supported_currencies: string[] | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          block_countries?: string[] | null
          category?: string | null
          created_at?: string | null
          game_id: string
          game_provider_id?: number | null
          game_type?: number | null
          gpid: number
          id?: string
          image?: string | null
          is_active?: boolean | null
          is_enabled?: boolean | null
          is_maintain?: boolean | null
          is_provider_online?: boolean | null
          lines?: number | null
          name: string
          new_game_type?: number | null
          provider?: string | null
          rank?: number | null
          reels?: number | null
          rows?: number | null
          rtp?: number | null
          supported_currencies?: string[] | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          block_countries?: string[] | null
          category?: string | null
          created_at?: string | null
          game_id?: string
          game_provider_id?: number | null
          game_type?: number | null
          gpid?: number
          id?: string
          image?: string | null
          is_active?: boolean | null
          is_enabled?: boolean | null
          is_maintain?: boolean | null
          is_provider_online?: boolean | null
          lines?: number | null
          name?: string
          new_game_type?: number | null
          provider?: string | null
          rank?: number | null
          reels?: number | null
          rows?: number | null
          rtp?: number | null
          supported_currencies?: string[] | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          target_users: string[] | null
          title: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          target_users?: string[] | null
          title: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          target_users?: string[] | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          balance: number | null
          created_at: string
          full_name: string
          id: string
          last_login_at: string | null
          last_login_ip: unknown | null
          phone_number: string | null
          referred_by: string | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          balance?: number | null
          created_at?: string
          full_name: string
          id?: string
          last_login_at?: string | null
          last_login_ip?: unknown | null
          phone_number?: string | null
          referred_by?: string | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          balance?: number | null
          created_at?: string
          full_name?: string
          id?: string
          last_login_at?: string | null
          last_login_ip?: unknown | null
          phone_number?: string | null
          referred_by?: string | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_referred_by_agents"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_used: boolean | null
          promotion_id: string | null
          updated_at: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_used?: boolean | null
          promotion_id?: string | null
          updated_at?: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_used?: boolean | null
          promotion_id?: string | null
          updated_at?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotion_codes_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          bonus_amount: number | null
          bonus_percentage: number | null
          created_at: string
          current_uses: number
          description: string | null
          end_date: string
          id: string
          image_url: string | null
          is_active: boolean
          is_first_deposit_only: boolean | null
          max_uses: number | null
          min_deposit: number | null
          promotion_code: string | null
          promotion_type: string | null
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          bonus_amount?: number | null
          bonus_percentage?: number | null
          created_at?: string
          current_uses?: number
          description?: string | null
          end_date: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_first_deposit_only?: boolean | null
          max_uses?: number | null
          min_deposit?: number | null
          promotion_code?: string | null
          promotion_type?: string | null
          start_date: string
          title: string
          updated_at?: string
        }
        Update: {
          bonus_amount?: number | null
          bonus_percentage?: number | null
          created_at?: string
          current_uses?: number
          description?: string | null
          end_date?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_first_deposit_only?: boolean | null
          max_uses?: number | null
          min_deposit?: number | null
          promotion_code?: string | null
          promotion_type?: string | null
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          admin_note: string | null
          amount: number
          approved_at: string | null
          approved_by: string | null
          bank_id: string | null
          created_at: string
          id: string
          proof_image_url: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          bank_id?: string | null
          created_at?: string
          id?: string
          proof_image_url?: string | null
          status?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          bank_id?: string | null
          created_at?: string
          id?: string
          proof_image_url?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_transactions_bank"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "bank"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_transactions_profiles_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "transactions_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "bank"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bank_accounts: {
        Row: {
          account_holder: string
          account_number: string
          bank_name: string
          created_at: string
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          account_holder: string
          account_number: string
          bank_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          account_holder?: string
          account_number?: string
          bank_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_or_update_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_first_deposit: {
        Args: { user_id_param: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
