import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          linkedin_id: string;
          linkedin_access_token: string;
          linkedin_refresh_token: string;
          profile_data: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          linkedin_id: string;
          linkedin_access_token: string;
          linkedin_refresh_token?: string;
          profile_data?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          linkedin_id?: string;
          linkedin_access_token?: string;
          linkedin_refresh_token?: string;
          profile_data?: any;
          updated_at?: string;
        };
      };
      content_posts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          content_type: 'post' | 'article' | 'carousel';
          tone: string;
          status: 'draft' | 'scheduled' | 'published' | 'failed';
          scheduled_at: string | null;
          published_at: string | null;
          linkedin_post_id: string | null;
          analytics_data: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          content_type: 'post' | 'article' | 'carousel';
          tone: string;
          status?: 'draft' | 'scheduled' | 'published' | 'failed';
          scheduled_at?: string | null;
          published_at?: string | null;
          linkedin_post_id?: string | null;
          analytics_data?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          content?: string;
          content_type?: 'post' | 'article' | 'carousel';
          tone?: string;
          status?: 'draft' | 'scheduled' | 'published' | 'failed';
          scheduled_at?: string | null;
          published_at?: string | null;
          linkedin_post_id?: string | null;
          analytics_data?: any;
          updated_at?: string;
        };
      };
      analytics_metrics: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          impressions: number;
          likes: number;
          comments: number;
          shares: number;
          clicks: number;
          engagement_rate: number;
          recorded_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          impressions?: number;
          likes?: number;
          comments?: number;
          shares?: number;
          clicks?: number;
          engagement_rate?: number;
          recorded_at?: string;
          created_at?: string;
        };
        Update: {
          impressions?: number;
          likes?: number;
          comments?: number;
          shares?: number;
          clicks?: number;
          engagement_rate?: number;
          recorded_at?: string;
        };
      };
    };
  };
};