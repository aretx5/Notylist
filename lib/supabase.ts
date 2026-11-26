import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Use SSR-compatible browser client for proper OAuth cookie handling
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          username: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string;
          background_color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon?: string;
          background_color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          icon?: string;
          background_color?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          category_id: string | null;
          background_color: string;
          is_pinned: boolean;
          is_favorite: boolean;
          is_deleted: boolean;
          deleted_at: string | null;
          share_type: 'private' | 'public' | 'password';
          share_password: string | null;
          share_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content?: string;
          category_id?: string | null;
          background_color?: string;
          is_pinned?: boolean;
          is_favorite?: boolean;
          is_deleted?: boolean;
          deleted_at?: string | null;
          share_type?: 'private' | 'public' | 'password';
          share_password?: string | null;
          share_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          category_id?: string | null;
          background_color?: string;
          is_pinned?: boolean;
          is_favorite?: boolean;
          is_deleted?: boolean;
          deleted_at?: string | null;
          share_type?: 'private' | 'public' | 'password';
          share_password?: string | null;
          share_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
