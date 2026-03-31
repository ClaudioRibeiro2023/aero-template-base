/**
 * Supabase Database Types
 *
 * This file should be auto-generated from the Supabase schema:
 *   supabase gen types typescript --project-id $PROJECT_ID > packages/shared/src/supabase/types.ts
 *
 * The types below are a manual baseline matching migration 001-004.
 * Regenerate after any schema change.
 */
import type { UserRole } from '@template/types'

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// UserRole importado de @template/types — fonte canônica: packages/types/src/auth.ts
export type { UserRole } from '@template/types'

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          plan: 'free' | 'starter' | 'pro' | 'enterprise'
          is_active: boolean
          settings: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          plan?: 'free' | 'starter' | 'pro' | 'enterprise'
          is_active?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          plan?: 'free' | 'starter' | 'pro' | 'enterprise'
          is_active?: boolean
          settings?: Json
          updated_at?: string
          deleted_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          tenant_id: string | null
          display_name: string
          email: string
          avatar_url: string | null
          phone: string | null
          department: string | null
          role: UserRole
          is_active: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          tenant_id?: string | null
          display_name?: string
          email?: string
          avatar_url?: string | null
          phone?: string | null
          department?: string | null
          role?: UserRole
          is_active?: boolean
          metadata?: Json
        }
        Update: {
          tenant_id?: string | null
          display_name?: string
          email?: string
          avatar_url?: string | null
          phone?: string | null
          department?: string | null
          role?: UserRole
          is_active?: boolean
          metadata?: Json
        }
      }
      admin_config: {
        Row: {
          id: string
          tenant_id: string
          branding: Json
          theme: Json
          navigation: Json
          notifications: Json
          maintenance_mode: boolean
          default_language: string
          default_timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          branding?: Json
          theme?: Json
          navigation?: Json
          notifications?: Json
          maintenance_mode?: boolean
          default_language?: string
          default_timezone?: string
        }
        Update: {
          branding?: Json
          theme?: Json
          navigation?: Json
          notifications?: Json
          maintenance_mode?: boolean
          default_language?: string
          default_timezone?: string
        }
      }
      feature_flags: {
        Row: {
          id: string
          tenant_id: string | null
          flag_name: string
          enabled: boolean
          description: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          flag_name: string
          enabled?: boolean
          description?: string | null
          metadata?: Json
        }
        Update: {
          flag_name?: string
          enabled?: boolean
          description?: string | null
          metadata?: Json
        }
      }
      audit_logs: {
        Row: {
          id: string
          tenant_id: string | null
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          details: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: never
      }
    }
    Functions: {
      get_user_tenant_id: {
        Args: Record<string, never>
        Returns: string
      }
      get_user_role: {
        Args: Record<string, never>
        Returns: UserRole
      }
      has_role: {
        Args: { required_role: UserRole }
        Returns: boolean
      }
      is_admin_or_gestor: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: UserRole
    }
  }
}
