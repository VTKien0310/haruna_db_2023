export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      check_in_entries: {
        Row: {
          date: string;
          id: string;
          time: string;
        };
        ComputedFields: never;
        Insert: {
          date: string;
          id?: string;
          time: string;
        };
        Update: {
          date?: string;
          id?: string;
          time?: string;
        };
        Relationships: [];
      };
      leave_work_entries: {
        Row: {
          date: string;
          end: string;
          id: string;
          start: string;
        };
        ComputedFields: never;
        Insert: {
          date: string;
          end: string;
          id?: string;
          start: string;
        };
        Update: {
          date?: string;
          end?: string;
          id?: string;
          start?: string;
        };
        Relationships: [];
      };
      medias: {
        Row: {
          created_at: string;
          id: string;
          mime: string;
          name: string;
          size: number;
          storage_path: string;
          thumbnail_path: string | null;
          type: number;
          updated_at: string;
          uploader_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          mime: string;
          name: string;
          size: number;
          storage_path: string;
          thumbnail_path?: string | null;
          type: number;
          updated_at?: string;
          uploader_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          mime?: string;
          name?: string;
          size?: number;
          storage_path?: string;
          thumbnail_path?: string | null;
          type?: number;
          updated_at?: string;
          uploader_id?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          current_balance: number;
          id: string;
          name: string | null;
          updated_at: string;
          user_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          current_balance?: number;
          id?: string;
          name?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          current_balance?: number;
          id?: string;
          name?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      pto_affect_entries: {
        Row: {
          created_at: string;
          entry_id: string | null;
          entry_type: string | null;
          id: string;
          no_deduction: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          entry_id?: string | null;
          entry_type?: string | null;
          id?: string;
          no_deduction?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          entry_id?: string | null;
          entry_type?: string | null;
          id?: string;
          no_deduction?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      pto_banks: {
        Row: {
          annual_balance: number;
          created_at: string;
          extended_balance: number;
          id: string;
          owner_id: string;
          updated_at: string;
          year: number;
        };
        ComputedFields: never;
        Insert: {
          annual_balance?: number;
          created_at?: string;
          extended_balance?: number;
          id?: string;
          owner_id?: string;
          updated_at?: string;
          year: number;
        };
        Update: {
          annual_balance?: number;
          created_at?: string;
          extended_balance?: number;
          id?: string;
          owner_id?: string;
          updated_at?: string;
          year?: number;
        };
        Relationships: [];
      };
      pto_transactions: {
        Row: {
          cause: string;
          created_at: string;
          entry_id: string;
          id: string;
          pto_bank_id: string;
          value: number;
        };
        ComputedFields: never;
        Insert: {
          cause: string;
          created_at?: string;
          entry_id: string;
          id?: string;
          pto_bank_id: string;
          value: number;
        };
        Update: {
          cause?: string;
          created_at?: string;
          entry_id?: string;
          id?: string;
          pto_bank_id?: string;
          value?: number;
        };
        Relationships: [
          {
            foreignKeyName: "pto_transactions_entry_id_fkey";
            columns: ["entry_id"];
            isOneToOne: false;
            referencedRelation: "pto_affect_entries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pto_transactions_pto_bank_id_fkey";
            columns: ["pto_bank_id"];
            isOneToOne: false;
            referencedRelation: "pto_banks";
            referencedColumns: ["id"];
          },
        ];
      };
      remote_work_entries: {
        Row: {
          date: string;
          id: string;
          type: number;
        };
        ComputedFields: never;
        Insert: {
          date: string;
          id?: string;
          type: number;
        };
        Update: {
          date?: string;
          id?: string;
          type?: number;
        };
        Relationships: [];
      };
      time_off_entries: {
        Row: {
          date: string;
          id: string;
          type: number;
        };
        ComputedFields: never;
        Insert: {
          date: string;
          id?: string;
          type: number;
        };
        Update: {
          date?: string;
          id?: string;
          type?: number;
        };
        Relationships: [];
      };
      translation_histories: {
        Row: {
          created_at: string;
          id: string;
          owner_id: string;
          source_language: string;
          source_text: string;
          target_language: string;
          translation: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          owner_id?: string;
          source_language: string;
          source_text: string;
          target_language: string;
          translation: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          owner_id?: string;
          source_language?: string;
          source_text?: string;
          target_language?: string;
          translation?: string;
        };
        Relationships: [];
      };
      webpage_bookmarks: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          level: number;
          name: string;
          owner_id: string | null;
          parent_id: string | null;
          root_id: string | null;
          type: number;
          updated_at: string;
          url: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          level: number;
          name: string;
          owner_id?: string | null;
          parent_id?: string | null;
          root_id?: string | null;
          type: number;
          updated_at?: string;
          url: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          level?: number;
          name?: string;
          owner_id?: string | null;
          parent_id?: string | null;
          root_id?: string | null;
          type?: number;
          updated_at?: string;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "webpage_bookmarks_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "webpage_bookmarks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "webpage_bookmarks_root_id_fkey";
            columns: ["root_id"];
            isOneToOne: false;
            referencedRelation: "webpage_bookmarks";
            referencedColumns: ["id"];
          },
        ];
      };
      work_time_entries: {
        Row: {
          date: string;
          id: string;
          type: number;
        };
        ComputedFields: never;
        Insert: {
          date: string;
          id?: string;
          type: number;
        };
        Update: {
          date?: string;
          id?: string;
          type?: number;
        };
        Relationships: [];
      };
      workday_exceptions: {
        Row: {
          created_at: string;
          date: string;
          id: string;
          time: number;
          type: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          date: string;
          id?: string;
          time: number;
          type: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          date?: string;
          id?: string;
          time?: number;
          type?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
