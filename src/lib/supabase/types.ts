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
      analyses: {
        Row: {
          created_at: string | null;
          creator_id: string;
          description: string;
          id: string;
          image_bucket: string;
          image_path: string;
          public: boolean | null;
          search_term: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          creator_id: string;
          description: string;
          id?: string;
          image_bucket: string;
          image_path: string;
          public?: boolean | null;
          search_term: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          creator_id?: string;
          description?: string;
          id?: string;
          image_bucket?: string;
          image_path?: string;
          public?: boolean | null;
          search_term?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      analysis_colors: {
        Row: {
          analysis_id: string;
          color_id: string;
        };
        Insert: {
          analysis_id: string;
          color_id: string;
        };
        Update: {
          analysis_id?: string;
          color_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'analysis_colors_analysis_id_fkey';
            columns: ['analysis_id'];
            isOneToOne: false;
            referencedRelation: 'analyses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'analysis_colors_color_id_fkey';
            columns: ['color_id'];
            isOneToOne: false;
            referencedRelation: 'colors';
            referencedColumns: ['id'];
          },
        ];
      };
      analysis_keywords: {
        Row: {
          analysis_id: string;
          keyword_id: string;
        };
        Insert: {
          analysis_id: string;
          keyword_id: string;
        };
        Update: {
          analysis_id?: string;
          keyword_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'analysis_keywords_analysis_id_fkey';
            columns: ['analysis_id'];
            isOneToOne: false;
            referencedRelation: 'analyses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'analysis_keywords_keyword_id_fkey';
            columns: ['keyword_id'];
            isOneToOne: false;
            referencedRelation: 'keywords';
            referencedColumns: ['id'];
          },
        ];
      };
      colors: {
        Row: {
          created_at: string | null;
          hex: string;
          id: string;
          name: string | null;
        };
        Insert: {
          created_at?: string | null;
          hex: string;
          id?: string;
          name?: string | null;
        };
        Update: {
          created_at?: string | null;
          hex?: string;
          id?: string;
          name?: string | null;
        };
        Relationships: [];
      };
      keywords: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_color: string;
          avatar_url: string | null;
          created_at: string;
          id: string;
          updated_at: string;
          username: string | null;
        };
        Insert: {
          avatar_color?: string;
          avatar_url?: string | null;
          created_at?: string;
          id: string;
          updated_at?: string;
          username?: string | null;
        };
        Update: {
          avatar_color?: string;
          avatar_url?: string | null;
          created_at?: string;
          id?: string;
          updated_at?: string;
          username?: string | null;
        };
        Relationships: [];
      };
      saved_analyses: {
        Row: {
          analysis_id: string | null;
          created_at: string | null;
          id: string;
          user_id: string;
        };
        Insert: {
          analysis_id?: string | null;
          created_at?: string | null;
          id?: string;
          user_id: string;
        };
        Update: {
          analysis_id?: string | null;
          created_at?: string | null;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'saved_analyses_analysis_id_fkey';
            columns: ['analysis_id'];
            isOneToOne: false;
            referencedRelation: 'analyses';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_analysis_with_relations: {
        Args: {
          p_colors: Json;
          p_creator_id: string;
          p_description: string;
          p_image_bucket: string;
          p_image_path: string;
          p_keywords: string[];
          p_public: boolean;
          p_search_term: string;
        };
        Returns: string;
      };
      get_analyses_with_save_status: {
        Args: {
          p_limit?: number;
          p_offset?: number;
          p_order_by?: string;
          p_order_direction?: string;
          p_user_id?: string;
        };
        Returns: {
          colors: Json[];
          created_at: string;
          creator: Json;
          description: string;
          id: string;
          image_bucket: string;
          image_path: string;
          is_saved: boolean;
          keywords: Json[];
          public: boolean;
          search_term: string;
          updated_at: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
