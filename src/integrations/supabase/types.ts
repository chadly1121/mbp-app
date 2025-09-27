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
      accountability_assignments: {
        Row: {
          id: string
          measurables_json: Json
          role_id: string
          user_id: string
        }
        Insert: {
          id?: string
          measurables_json?: Json
          role_id: string
          user_id: string
        }
        Update: {
          id?: string
          measurables_json?: Json
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accountability_assignments_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "accountability_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      accountability_roles: {
        Row: {
          description: string | null
          id: string
          org_id: string
          title: string
        }
        Insert: {
          description?: string | null
          id?: string
          org_id: string
          title: string
        }
        Update: {
          description?: string | null
          id?: string
          org_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "accountability_roles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      action_items: {
        Row: {
          assigned_to: string | null
          category: string | null
          company_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          company_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          company_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      activity_log: {
        Row: {
          action: string
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          metadata_json: Json
          org_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          metadata_json?: Json
          org_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          metadata_json?: Json
          org_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string
          id: string
          key_hash: string
          name: string
          org_id: string
          scopes_json: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key_hash: string
          name: string
          org_id: string
          scopes_json?: Json
        }
        Update: {
          created_at?: string
          id?: string
          key_hash?: string
          name?: string
          org_id?: string
          scopes_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ar_tracker: {
        Row: {
          balance_due: number
          client_name: string
          company_id: string
          created_at: string
          days_outstanding: number | null
          due_date: string
          id: string
          invoice_amount: number
          invoice_date: string
          invoice_number: string
          notes: string | null
          paid_amount: number | null
          payment_terms: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          balance_due: number
          client_name: string
          company_id: string
          created_at?: string
          days_outstanding?: number | null
          due_date: string
          id?: string
          invoice_amount: number
          invoice_date: string
          invoice_number: string
          notes?: string | null
          paid_amount?: number | null
          payment_terms?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          balance_due?: number
          client_name?: string
          company_id?: string
          created_at?: string
          days_outstanding?: number | null
          due_date?: string
          id?: string
          invoice_amount?: number
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          paid_amount?: number | null
          payment_terms?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      budget_plans: {
        Row: {
          account_name: string
          actual_amount: number | null
          budget_type: string
          budgeted_amount: number | null
          category: string
          company_id: string
          created_at: string
          id: string
          month_number: number
          subcategory: string | null
          updated_at: string
          variance_amount: number | null
          variance_percent: number | null
          year: number
        }
        Insert: {
          account_name: string
          actual_amount?: number | null
          budget_type?: string
          budgeted_amount?: number | null
          category: string
          company_id: string
          created_at?: string
          id?: string
          month_number: number
          subcategory?: string | null
          updated_at?: string
          variance_amount?: number | null
          variance_percent?: number | null
          year: number
        }
        Update: {
          account_name?: string
          actual_amount?: number | null
          budget_type?: string
          budgeted_amount?: number | null
          category?: string
          company_id?: string
          created_at?: string
          id?: string
          month_number?: number
          subcategory?: string | null
          updated_at?: string
          variance_amount?: number | null
          variance_percent?: number | null
          year?: number
        }
        Relationships: []
      }
      cash_flow_projections: {
        Row: {
          actual_amount: number | null
          category: string
          company_id: string
          created_at: string
          id: string
          month: number
          notes: string | null
          projected_amount: number
          subcategory: string | null
          updated_at: string
          year: number
        }
        Insert: {
          actual_amount?: number | null
          category: string
          company_id: string
          created_at?: string
          id?: string
          month: number
          notes?: string | null
          projected_amount?: number
          subcategory?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          actual_amount?: number | null
          category?: string
          company_id?: string
          created_at?: string
          id?: string
          month?: number
          notes?: string | null
          projected_amount?: number
          subcategory?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      chart_of_accounts: {
        Row: {
          account_code: string
          account_name: string
          account_type: string
          company_id: string
          created_at: string
          id: string
          is_active: boolean | null
          parent_id: string | null
          qbo_id: string | null
          updated_at: string
        }
        Insert: {
          account_code: string
          account_name: string
          account_type: string
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          parent_id?: string | null
          qbo_id?: string | null
          updated_at?: string
        }
        Update: {
          account_code?: string
          account_name?: string
          account_type?: string
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          parent_id?: string | null
          qbo_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chart_of_accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      habits_tracker: {
        Row: {
          company_id: string
          completed: boolean | null
          created_at: string
          date_tracked: string
          habit_category: string | null
          habit_name: string
          id: string
          notes: string | null
          streak_count: number | null
          target_frequency: string | null
          updated_at: string
          user_name: string
        }
        Insert: {
          company_id: string
          completed?: boolean | null
          created_at?: string
          date_tracked: string
          habit_category?: string | null
          habit_name: string
          id?: string
          notes?: string | null
          streak_count?: number | null
          target_frequency?: string | null
          updated_at?: string
          user_name: string
        }
        Update: {
          company_id?: string
          completed?: boolean | null
          created_at?: string
          date_tracked?: string
          habit_category?: string | null
          habit_name?: string
          id?: string
          notes?: string | null
          streak_count?: number | null
          target_frequency?: string | null
          updated_at?: string
          user_name?: string
        }
        Relationships: []
      }
      implementation_plan: {
        Row: {
          actual_completion_date: string | null
          actual_start_date: string | null
          category: string | null
          company_id: string
          created_at: string
          description: string | null
          id: string
          initiative_name: string
          notes: string | null
          planned_completion_date: string | null
          planned_start_date: string | null
          priority: string | null
          progress_percentage: number | null
          responsible_person: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          actual_completion_date?: string | null
          actual_start_date?: string | null
          category?: string | null
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          initiative_name: string
          notes?: string | null
          planned_completion_date?: string | null
          planned_start_date?: string | null
          priority?: string | null
          progress_percentage?: number | null
          responsible_person?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          actual_completion_date?: string | null
          actual_start_date?: string | null
          category?: string | null
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          initiative_name?: string
          notes?: string | null
          planned_completion_date?: string | null
          planned_start_date?: string | null
          priority?: string | null
          progress_percentage?: number | null
          responsible_person?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      income_statements: {
        Row: {
          budget_amount: number | null
          category: string
          company_id: string
          created_at: string
          current_month: number | null
          id: string
          line_item: string
          month_number: number
          statement_type: string
          subcategory: string | null
          updated_at: string
          variance_amount: number | null
          year: number
          year_to_date: number | null
        }
        Insert: {
          budget_amount?: number | null
          category: string
          company_id: string
          created_at?: string
          current_month?: number | null
          id?: string
          line_item: string
          month_number: number
          statement_type?: string
          subcategory?: string | null
          updated_at?: string
          variance_amount?: number | null
          year: number
          year_to_date?: number | null
        }
        Update: {
          budget_amount?: number | null
          category?: string
          company_id?: string
          created_at?: string
          current_month?: number | null
          id?: string
          line_item?: string
          month_number?: number
          statement_type?: string
          subcategory?: string | null
          updated_at?: string
          variance_amount?: number | null
          year?: number
          year_to_date?: number | null
        }
        Relationships: []
      }
      issues: {
        Row: {
          closed_at: string | null
          created_at: string
          description: string | null
          id: string
          org_id: string
          priority: Database["public"]["Enums"]["issue_priority"]
          status: Database["public"]["Enums"]["issue_status"]
          title: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          org_id: string
          priority?: Database["public"]["Enums"]["issue_priority"]
          status?: Database["public"]["Enums"]["issue_status"]
          title: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          org_id?: string
          priority?: Database["public"]["Enums"]["issue_priority"]
          status?: Database["public"]["Enums"]["issue_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "issues_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      job_planner: {
        Row: {
          actual_completion_date: string | null
          actual_cost: number | null
          actual_hours: number | null
          actual_start_date: string | null
          client_name: string | null
          company_id: string
          created_at: string
          estimated_cost: number | null
          estimated_hours: number | null
          hourly_rate: number | null
          id: string
          job_name: string
          job_type: string | null
          notes: string | null
          planned_completion_date: string | null
          planned_start_date: string | null
          profitability: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          actual_completion_date?: string | null
          actual_cost?: number | null
          actual_hours?: number | null
          actual_start_date?: string | null
          client_name?: string | null
          company_id: string
          created_at?: string
          estimated_cost?: number | null
          estimated_hours?: number | null
          hourly_rate?: number | null
          id?: string
          job_name: string
          job_type?: string | null
          notes?: string | null
          planned_completion_date?: string | null
          planned_start_date?: string | null
          profitability?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          actual_completion_date?: string | null
          actual_cost?: number | null
          actual_hours?: number | null
          actual_start_date?: string | null
          client_name?: string | null
          company_id?: string
          created_at?: string
          estimated_cost?: number | null
          estimated_hours?: number | null
          hourly_rate?: number | null
          id?: string
          job_name?: string
          job_type?: string | null
          notes?: string | null
          planned_completion_date?: string | null
          planned_start_date?: string | null
          profitability?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      kpis: {
        Row: {
          company_id: string
          created_at: string
          current_value: number | null
          description: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          name: string
          target_value: number
          unit: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          current_value?: number | null
          description?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          target_value: number
          unit?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          current_value?: number | null
          description?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          target_value?: number
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lead_funnel: {
        Row: {
          average_value: number | null
          company_id: string
          conversion_rate: number | null
          created_at: string
          id: string
          leads_count: number | null
          month_number: number
          notes: string | null
          stage_name: string
          stage_order: number
          updated_at: string
          year: number
        }
        Insert: {
          average_value?: number | null
          company_id: string
          conversion_rate?: number | null
          created_at?: string
          id?: string
          leads_count?: number | null
          month_number: number
          notes?: string | null
          stage_name: string
          stage_order: number
          updated_at?: string
          year: number
        }
        Update: {
          average_value?: number | null
          company_id?: string
          conversion_rate?: number | null
          created_at?: string
          id?: string
          leads_count?: number | null
          month_number?: number
          notes?: string | null
          stage_name?: string
          stage_order?: number
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      market_analysis: {
        Row: {
          analysis_type: string
          company_id: string
          created_at: string
          data_unit: string | null
          data_value: number | null
          date_analyzed: string | null
          description: string | null
          id: string
          source: string | null
          title: string
          updated_at: string
        }
        Insert: {
          analysis_type: string
          company_id: string
          created_at?: string
          data_unit?: string | null
          data_value?: number | null
          date_analyzed?: string | null
          description?: string | null
          id?: string
          source?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          analysis_type?: string
          company_id?: string
          created_at?: string
          data_unit?: string | null
          data_value?: number | null
          date_analyzed?: string | null
          description?: string | null
          id?: string
          source?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketing_plan: {
        Row: {
          actual_leads: number | null
          actual_spend: number | null
          campaign_end_date: string | null
          campaign_name: string
          campaign_start_date: string | null
          company_id: string
          conversion_rate: number | null
          created_at: string
          id: string
          marketing_channel: string
          notes: string | null
          planned_budget: number | null
          planned_leads: number | null
          roi: number | null
          status: string | null
          target_audience: string | null
          updated_at: string
        }
        Insert: {
          actual_leads?: number | null
          actual_spend?: number | null
          campaign_end_date?: string | null
          campaign_name: string
          campaign_start_date?: string | null
          company_id: string
          conversion_rate?: number | null
          created_at?: string
          id?: string
          marketing_channel: string
          notes?: string | null
          planned_budget?: number | null
          planned_leads?: number | null
          roi?: number | null
          status?: string | null
          target_audience?: string | null
          updated_at?: string
        }
        Update: {
          actual_leads?: number | null
          actual_spend?: number | null
          campaign_end_date?: string | null
          campaign_name?: string
          campaign_start_date?: string | null
          company_id?: string
          conversion_rate?: number | null
          created_at?: string
          id?: string
          marketing_channel?: string
          notes?: string | null
          planned_budget?: number | null
          planned_leads?: number | null
          roi?: number | null
          status?: string | null
          target_audience?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      mbp_config: {
        Row: {
          budget_type: string | null
          company_id: string
          created_at: string
          file_type: string | null
          fiscal_year: number
          fiscal_year_start: string
          id: string
          insurance_inclusion: string | null
          planning_fiscal_year: string | null
          tracking_period: string | null
          updated_at: string
        }
        Insert: {
          budget_type?: string | null
          company_id: string
          created_at?: string
          file_type?: string | null
          fiscal_year?: number
          fiscal_year_start?: string
          id?: string
          insurance_inclusion?: string | null
          planning_fiscal_year?: string | null
          tracking_period?: string | null
          updated_at?: string
        }
        Update: {
          budget_type?: string | null
          company_id?: string
          created_at?: string
          file_type?: string | null
          fiscal_year?: number
          fiscal_year_start?: string
          id?: string
          insurance_inclusion?: string | null
          planning_fiscal_year?: string | null
          tracking_period?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      meeting_agenda: {
        Row: {
          content_json: Json
          id: string
          meeting_id: string
          position: number
          section: string
        }
        Insert: {
          content_json?: Json
          id?: string
          meeting_id: string
          position: number
          section: string
        }
        Update: {
          content_json?: Json
          id?: string
          meeting_id?: string
          position?: number
          section?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_agenda_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_notes: {
        Row: {
          content_json: Json
          created_at: string
          created_by: string
          id: string
          meeting_id: string
        }
        Insert: {
          content_json?: Json
          created_at?: string
          created_by: string
          id?: string
          meeting_id: string
        }
        Update: {
          content_json?: Json
          created_at?: string
          created_by?: string
          id?: string
          meeting_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_notes_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          created_at: string
          created_by: string
          duration_min: number | null
          id: string
          name: string
          org_id: string
          scheduled_at: string | null
          type: Database["public"]["Enums"]["meeting_type"]
        }
        Insert: {
          created_at?: string
          created_by: string
          duration_min?: number | null
          id?: string
          name: string
          org_id: string
          scheduled_at?: string | null
          type: Database["public"]["Enums"]["meeting_type"]
        }
        Update: {
          created_at?: string
          created_by?: string
          duration_min?: number | null
          id?: string
          name?: string
          org_id?: string
          scheduled_at?: string | null
          type?: Database["public"]["Enums"]["meeting_type"]
        }
        Relationships: [
          {
            foreignKeyName: "meetings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_budgets: {
        Row: {
          account_id: string
          actual_amount: number | null
          budget_month: number
          budget_year: number
          budgeted_amount: number
          company_id: string
          created_at: string
          id: string
          product_id: string
          updated_at: string
          variance_amount: number | null
          variance_percent: number | null
        }
        Insert: {
          account_id: string
          actual_amount?: number | null
          budget_month: number
          budget_year: number
          budgeted_amount?: number
          company_id: string
          created_at?: string
          id?: string
          product_id: string
          updated_at?: string
          variance_amount?: number | null
          variance_percent?: number | null
        }
        Update: {
          account_id?: string
          actual_amount?: number | null
          budget_month?: number
          budget_year?: number
          budgeted_amount?: number
          company_id?: string
          created_at?: string
          id?: string
          product_id?: string
          updated_at?: string
          variance_amount?: number | null
          variance_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_budgets_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_budgets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_budgets_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_reviews: {
        Row: {
          challenges_faced: string | null
          company_id: string
          created_at: string
          expenses_actual: number | null
          expenses_target: number | null
          id: string
          key_achievements: string | null
          lessons_learned: string | null
          next_month_focus: string | null
          revenue_actual: number | null
          revenue_target: number | null
          review_month: number
          review_year: number
          updated_at: string
        }
        Insert: {
          challenges_faced?: string | null
          company_id: string
          created_at?: string
          expenses_actual?: number | null
          expenses_target?: number | null
          id?: string
          key_achievements?: string | null
          lessons_learned?: string | null
          next_month_focus?: string | null
          revenue_actual?: number | null
          revenue_target?: number | null
          review_month: number
          review_year: number
          updated_at?: string
        }
        Update: {
          challenges_faced?: string | null
          company_id?: string
          created_at?: string
          expenses_actual?: number | null
          expenses_target?: number | null
          id?: string
          key_achievements?: string | null
          lessons_learned?: string | null
          next_month_focus?: string | null
          revenue_actual?: number | null
          revenue_target?: number | null
          review_month?: number
          review_year?: number
          updated_at?: string
        }
        Relationships: []
      }
      objective_activity: {
        Row: {
          created_at: string
          data: Json
          id: string
          kind: string
          objective_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          kind: string
          objective_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          kind?: string
          objective_id?: string
        }
        Relationships: []
      }
      objective_checklist_items: {
        Row: {
          company_id: string
          created_at: string
          due_date: string | null
          id: string
          objective_id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          objective_id: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          objective_id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "objective_checklist_items_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "strategic_objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      objective_checklist_subitems: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_completed: boolean
          parent_item_id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_completed?: boolean
          parent_item_id: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_completed?: boolean
          parent_item_id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "objective_checklist_subitems_parent_item_id_fkey"
            columns: ["parent_item_id"]
            isOneToOne: false
            referencedRelation: "objective_checklist_items"
            referencedColumns: ["id"]
          },
        ]
      }
      objective_collab_members: {
        Row: {
          email: string
          id: string
          joined_at: string
          objective_id: string
          role: string
        }
        Insert: {
          email: string
          id?: string
          joined_at?: string
          objective_id: string
          role: string
        }
        Update: {
          email?: string
          id?: string
          joined_at?: string
          objective_id?: string
          role?: string
        }
        Relationships: []
      }
      objective_comments: {
        Row: {
          author_email: string | null
          author_id: string | null
          body: string
          created_at: string
          id: string
          objective_id: string
        }
        Insert: {
          author_email?: string | null
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          objective_id: string
        }
        Update: {
          author_email?: string | null
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          objective_id?: string
        }
        Relationships: []
      }
      objective_invites: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          objective_id: string
          role: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          objective_id: string
          role: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          objective_id?: string
          role?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      objective_link_access: {
        Row: {
          accessed_at: string | null
          email: string | null
          id: string
          link_id: string | null
        }
        Insert: {
          accessed_at?: string | null
          email?: string | null
          id?: string
          link_id?: string | null
        }
        Update: {
          accessed_at?: string | null
          email?: string | null
          id?: string
          link_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objective_link_access_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "objective_links"
            referencedColumns: ["id"]
          },
        ]
      }
      objective_links: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          objective_id: string
          revoked: boolean | null
          role: string | null
          token: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          objective_id: string
          revoked?: boolean | null
          role?: string | null
          token?: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          objective_id?: string
          revoked?: boolean | null
          role?: string | null
          token?: string
        }
        Relationships: []
      }
      org_members: {
        Row: {
          created_at: string
          id: string
          invited_by: string | null
          org_id: string
          role: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by?: string | null
          org_id: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string | null
          org_id?: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizational_structure: {
        Row: {
          company_id: string
          created_at: string
          department: string | null
          employee_name: string | null
          employment_type: string | null
          id: string
          position_title: string
          reports_to_position: string | null
          required_skills: string | null
          responsibilities: string | null
          salary_range: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          department?: string | null
          employee_name?: string | null
          employment_type?: string | null
          id?: string
          position_title: string
          reports_to_position?: string | null
          required_skills?: string | null
          responsibilities?: string | null
          salary_range?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          department?: string | null
          employee_name?: string | null
          employment_type?: string | null
          id?: string
          position_title?: string
          reports_to_position?: string | null
          required_skills?: string | null
          responsibilities?: string | null
          salary_range?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          plan: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          plan?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          plan?: string | null
        }
        Relationships: []
      }
      presence: {
        Row: {
          last_seen: string
          org_id: string
          page: string
          user_id: string
        }
        Insert: {
          last_seen?: string
          org_id: string
          page: string
          user_id: string
        }
        Update: {
          last_seen?: string
          org_id?: string
          page?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "presence_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      processes: {
        Row: {
          content_json: Json
          created_at: string
          id: string
          name: string
          org_id: string
          owner_user_id: string | null
          updated_at: string
          version: number
        }
        Insert: {
          content_json?: Json
          created_at?: string
          id?: string
          name: string
          org_id: string
          owner_user_id?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          content_json?: Json
          created_at?: string
          id?: string
          name?: string
          org_id?: string
          owner_user_id?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "processes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      production_planning: {
        Row: {
          actual_cost: number | null
          actual_end_date: string | null
          actual_hours: number | null
          actual_start_date: string | null
          company_id: string
          created_at: string
          id: string
          notes: string | null
          planned_cost: number | null
          planned_end_date: string | null
          planned_hours: number | null
          planned_start_date: string | null
          production_type: string
          project_name: string
          status: string | null
          updated_at: string
        }
        Insert: {
          actual_cost?: number | null
          actual_end_date?: string | null
          actual_hours?: number | null
          actual_start_date?: string | null
          company_id: string
          created_at?: string
          id?: string
          notes?: string | null
          planned_cost?: number | null
          planned_end_date?: string | null
          planned_hours?: number | null
          planned_start_date?: string | null
          production_type: string
          project_name: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          actual_cost?: number | null
          actual_end_date?: string | null
          actual_hours?: number | null
          actual_start_date?: string | null
          company_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          planned_cost?: number | null
          planned_end_date?: string | null
          planned_hours?: number | null
          planned_start_date?: string | null
          production_type?: string
          project_name?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          product_type: string
          qbo_id: string | null
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          product_type: string
          qbo_id?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          product_type?: string
          qbo_id?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          beta_access_status: string | null
          beta_approved_at: string | null
          beta_approved_by: string | null
          beta_requested_at: string | null
          company_name: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
          user_role: Database["public"]["Enums"]["app_role"] | null
        }
        Insert: {
          avatar_url?: string | null
          beta_access_status?: string | null
          beta_approved_at?: string | null
          beta_approved_by?: string | null
          beta_requested_at?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          user_role?: Database["public"]["Enums"]["app_role"] | null
        }
        Update: {
          avatar_url?: string | null
          beta_access_status?: string | null
          beta_approved_at?: string | null
          beta_approved_by?: string | null
          beta_requested_at?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          user_role?: Database["public"]["Enums"]["app_role"] | null
        }
        Relationships: []
      }
      qbo_connections: {
        Row: {
          access_token: string
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          last_sync_at: string | null
          qbo_company_id: string
          refresh_token: string
          token_expires_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          qbo_company_id: string
          refresh_token: string
          token_expires_at: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          qbo_company_id?: string
          refresh_token?: string
          token_expires_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      qbo_profit_loss: {
        Row: {
          account_id: string | null
          account_name: string
          account_type: string
          budget_current_month: number | null
          budget_quarter_to_date: number | null
          budget_year_to_date: number | null
          company_id: string
          created_at: string
          current_month: number | null
          fiscal_month: number
          fiscal_quarter: number | null
          fiscal_year: number
          id: string
          qbo_account_id: string | null
          quarter_to_date: number | null
          report_date: string
          updated_at: string
          variance_current_month: number | null
          variance_quarter_to_date: number | null
          variance_year_to_date: number | null
          year_to_date: number | null
        }
        Insert: {
          account_id?: string | null
          account_name: string
          account_type: string
          budget_current_month?: number | null
          budget_quarter_to_date?: number | null
          budget_year_to_date?: number | null
          company_id: string
          created_at?: string
          current_month?: number | null
          fiscal_month: number
          fiscal_quarter?: number | null
          fiscal_year: number
          id?: string
          qbo_account_id?: string | null
          quarter_to_date?: number | null
          report_date: string
          updated_at?: string
          variance_current_month?: number | null
          variance_quarter_to_date?: number | null
          variance_year_to_date?: number | null
          year_to_date?: number | null
        }
        Update: {
          account_id?: string | null
          account_name?: string
          account_type?: string
          budget_current_month?: number | null
          budget_quarter_to_date?: number | null
          budget_year_to_date?: number | null
          company_id?: string
          created_at?: string
          current_month?: number | null
          fiscal_month?: number
          fiscal_quarter?: number | null
          fiscal_year?: number
          id?: string
          qbo_account_id?: string | null
          quarter_to_date?: number | null
          report_date?: string
          updated_at?: string
          variance_current_month?: number | null
          variance_quarter_to_date?: number | null
          variance_year_to_date?: number | null
          year_to_date?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "qbo_profit_loss_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_forecasts: {
        Row: {
          actual_amount: number | null
          company_id: string
          created_at: string
          forecasted_amount: number
          id: string
          month: number
          notes: string | null
          product_id: string | null
          updated_at: string
          year: number
        }
        Insert: {
          actual_amount?: number | null
          company_id: string
          created_at?: string
          forecasted_amount?: number
          id?: string
          month: number
          notes?: string | null
          product_id?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          actual_amount?: number | null
          company_id?: string
          created_at?: string
          forecasted_amount?: number
          id?: string
          month?: number
          notes?: string | null
          product_id?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      revenue_produced: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_total_production: boolean | null
          month_number: number | null
          produced_revenue: number | null
          production_name: string
          production_type: string
          target_revenue: number | null
          updated_at: string
          variance_revenue: number | null
          week_number: number | null
          year: number
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_total_production?: boolean | null
          month_number?: number | null
          produced_revenue?: number | null
          production_name: string
          production_type: string
          target_revenue?: number | null
          updated_at?: string
          variance_revenue?: number | null
          week_number?: number | null
          year: number
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_total_production?: boolean | null
          month_number?: number | null
          produced_revenue?: number | null
          production_name?: string
          production_type?: string
          target_revenue?: number | null
          updated_at?: string
          variance_revenue?: number | null
          week_number?: number | null
          year?: number
        }
        Relationships: []
      }
      rocks: {
        Row: {
          description: string | null
          due_quarter: string
          id: string
          org_id: string
          owner_user_id: string
          status: Database["public"]["Enums"]["rock_status"]
          title: string
          updated_at: string
        }
        Insert: {
          description?: string | null
          due_quarter: string
          id?: string
          org_id: string
          owner_user_id: string
          status?: Database["public"]["Enums"]["rock_status"]
          title: string
          updated_at?: string
        }
        Update: {
          description?: string | null
          due_quarter?: string
          id?: string
          org_id?: string
          owner_user_id?: string
          status?: Database["public"]["Enums"]["rock_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rocks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_pipeline: {
        Row: {
          actual_close_date: string | null
          client_name: string | null
          company_id: string
          created_at: string
          estimated_close_date: string | null
          estimated_value: number | null
          id: string
          opportunity_name: string
          probability: number | null
          stage: string
          status: string | null
          updated_at: string
        }
        Insert: {
          actual_close_date?: string | null
          client_name?: string | null
          company_id: string
          created_at?: string
          estimated_close_date?: string | null
          estimated_value?: number | null
          id?: string
          opportunity_name: string
          probability?: number | null
          stage: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          actual_close_date?: string | null
          client_name?: string | null
          company_id?: string
          created_at?: string
          estimated_close_date?: string | null
          estimated_value?: number | null
          id?: string
          opportunity_name?: string
          probability?: number | null
          stage?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sales_plans: {
        Row: {
          actual_revenue: number | null
          company_id: string
          created_at: string
          id: string
          is_total_plan: boolean | null
          month_number: number | null
          notes: string | null
          plan_name: string
          plan_type: string
          planned_revenue: number | null
          updated_at: string
          variance_revenue: number | null
          week_number: number | null
          year: number
        }
        Insert: {
          actual_revenue?: number | null
          company_id: string
          created_at?: string
          id?: string
          is_total_plan?: boolean | null
          month_number?: number | null
          notes?: string | null
          plan_name: string
          plan_type: string
          planned_revenue?: number | null
          updated_at?: string
          variance_revenue?: number | null
          week_number?: number | null
          year: number
        }
        Update: {
          actual_revenue?: number | null
          company_id?: string
          created_at?: string
          id?: string
          is_total_plan?: boolean | null
          month_number?: number | null
          notes?: string | null
          plan_name?: string
          plan_type?: string
          planned_revenue?: number | null
          updated_at?: string
          variance_revenue?: number | null
          week_number?: number | null
          year?: number
        }
        Relationships: []
      }
      scorecard_entries: {
        Row: {
          created_at: string
          id: string
          metric_id: string
          note: string | null
          value: number | null
          week_start_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric_id: string
          note?: string | null
          value?: number | null
          week_start_date: string
        }
        Update: {
          created_at?: string
          id?: string
          metric_id?: string
          note?: string | null
          value?: number | null
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "scorecard_entries_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "scorecard_metrics"
            referencedColumns: ["id"]
          },
        ]
      }
      scorecard_metrics: {
        Row: {
          check_day: number | null
          created_at: string
          id: string
          is_leading: boolean | null
          name: string
          org_id: string
          owner_user_id: string
          target_value: number | null
          unit: string | null
        }
        Insert: {
          check_day?: number | null
          created_at?: string
          id?: string
          is_leading?: boolean | null
          name: string
          org_id: string
          owner_user_id: string
          target_value?: number | null
          unit?: string | null
        }
        Update: {
          check_day?: number | null
          created_at?: string
          id?: string
          is_leading?: boolean | null
          name?: string
          org_id?: string
          owner_user_id?: string
          target_value?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scorecard_metrics_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      strategic_objective_activity: {
        Row: {
          activity_description: string
          activity_type: string
          company_id: string
          created_at: string
          id: string
          metadata: Json | null
          objective_id: string
          user_email: string | null
          user_name: string | null
        }
        Insert: {
          activity_description: string
          activity_type: string
          company_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          objective_id: string
          user_email?: string | null
          user_name?: string | null
        }
        Update: {
          activity_description?: string
          activity_type?: string
          company_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          objective_id?: string
          user_email?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      strategic_objective_checklist: {
        Row: {
          created_at: string
          id: string
          is_completed: boolean | null
          item_text: string
          objective_id: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_completed?: boolean | null
          item_text: string
          objective_id: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_completed?: boolean | null
          item_text?: string
          objective_id?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategic_objective_checklist_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "strategic_objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      strategic_objective_collaborators: {
        Row: {
          company_id: string
          created_at: string
          id: string
          invited_by: string
          objective_id: string
          role: string
          status: string
          updated_at: string
          user_email: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          invited_by: string
          objective_id: string
          role?: string
          status?: string
          updated_at?: string
          user_email: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          invited_by?: string
          objective_id?: string
          role?: string
          status?: string
          updated_at?: string
          user_email?: string
        }
        Relationships: []
      }
      strategic_objective_comments: {
        Row: {
          company_id: string
          content: string
          created_at: string
          id: string
          objective_id: string
          updated_at: string
          user_email: string
          user_name: string
        }
        Insert: {
          company_id: string
          content: string
          created_at?: string
          id?: string
          objective_id: string
          updated_at?: string
          user_email: string
          user_name: string
        }
        Update: {
          company_id?: string
          content?: string
          created_at?: string
          id?: string
          objective_id?: string
          updated_at?: string
          user_email?: string
          user_name?: string
        }
        Relationships: []
      }
      strategic_objectives: {
        Row: {
          company_id: string
          completion_percentage: number | null
          created_at: string
          description: string | null
          id: string
          priority: string | null
          status: string | null
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          completion_percentage?: number | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          completion_percentage?: number | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      todos: {
        Row: {
          completed: boolean
          created_at: string
          due_date: string | null
          id: string
          org_id: string
          owner_user_id: string
          title: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          due_date?: string | null
          id?: string
          org_id: string
          owner_user_id: string
          title: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          due_date?: string | null
          id?: string
          org_id?: string
          owner_user_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "todos_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_line_items: {
        Row: {
          account_id: string
          created_at: string
          credit_amount: number | null
          debit_amount: number | null
          description: string | null
          id: string
          product_id: string | null
          quantity: number | null
          transaction_id: string
          unit_price: number | null
        }
        Insert: {
          account_id: string
          created_at?: string
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string | null
          id?: string
          product_id?: string | null
          quantity?: number | null
          transaction_id: string
          unit_price?: number | null
        }
        Update: {
          account_id?: string
          created_at?: string
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string | null
          id?: string
          product_id?: string | null
          quantity?: number | null
          transaction_id?: string
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_line_items_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_line_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_line_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          description: string
          id: string
          reference_number: string | null
          total_amount: number
          transaction_date: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          description: string
          id?: string
          reference_number?: string | null
          total_amount: number
          transaction_date: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          reference_number?: string | null
          total_amount?: number
          transaction_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      victories_wins: {
        Row: {
          category: string | null
          company_id: string
          created_at: string
          date_achieved: string
          description: string | null
          id: string
          impact_level: string | null
          lessons_learned: string | null
          team_members: string | null
          updated_at: string
          victory_title: string
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string
          date_achieved: string
          description?: string | null
          id?: string
          impact_level?: string | null
          lessons_learned?: string | null
          team_members?: string | null
          updated_at?: string
          victory_title: string
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string
          date_achieved?: string
          description?: string | null
          id?: string
          impact_level?: string | null
          lessons_learned?: string | null
          team_members?: string | null
          updated_at?: string
          victory_title?: string
        }
        Relationships: []
      }
      vto: {
        Row: {
          id: string
          marketing_strategy: Json | null
          one_year_plan: Json | null
          org_id: string
          quarterly_priorities_notes: Json | null
          three_year_picture: Json | null
          updated_at: string
          vision: Json | null
        }
        Insert: {
          id?: string
          marketing_strategy?: Json | null
          one_year_plan?: Json | null
          org_id: string
          quarterly_priorities_notes?: Json | null
          three_year_picture?: Json | null
          updated_at?: string
          vision?: Json | null
        }
        Update: {
          id?: string
          marketing_strategy?: Json | null
          one_year_plan?: Json | null
          org_id?: string
          quarterly_priorities_notes?: Json | null
          three_year_picture?: Json | null
          updated_at?: string
          vision?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "vto_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      current_user_memberships: {
        Row: {
          org_id: string | null
          role: Database["public"]["Enums"]["member_role"] | null
        }
        Insert: {
          org_id?: string | null
          role?: Database["public"]["Enums"]["member_role"] | null
        }
        Update: {
          org_id?: string | null
          role?: Database["public"]["Enums"]["member_role"] | null
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      can_access_qbo_connection: {
        Args: { p_company_id: string }
        Returns: boolean
      }
      create_default_chart_of_accounts: {
        Args: { company_id_param: string }
        Returns: undefined
      }
      get_qbo_connection_status: {
        Args: { p_company_id: string }
        Returns: {
          created_at: string
          id: string
          is_active: boolean
          last_sync_at: string
          qbo_company_id: string
          token_expires_at: string
          updated_at: string
        }[]
      }
      get_qbo_connection_status_safe: {
        Args: { p_company_id: string }
        Returns: {
          created_at: string
          id: string
          is_active: boolean
          last_sync_at: string
          qbo_company_id: string
          token_expires_at: string
          updated_at: string
        }[]
      }
      get_qbo_tokens: {
        Args: { p_company_id: string }
        Returns: {
          access_token: string
          qbo_company_id: string
          refresh_token: string
          token_expires_at: string
        }[]
      }
      has_beta_access: {
        Args: { user_id: string }
        Returns: boolean
      }
      has_org_role: {
        Args: {
          allowed: Database["public"]["Enums"]["member_role"][]
          p_org: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_org_member: {
        Args: { p_org: string }
        Returns: boolean
      }
      store_qbo_connection: {
        Args: {
          p_access_token: string
          p_company_id: string
          p_qbo_company_id: string
          p_refresh_token: string
          p_token_expires_at: string
        }
        Returns: string
      }
      update_qbo_connection_status: {
        Args: { p_company_id: string; p_is_active: boolean }
        Returns: undefined
      }
      update_qbo_last_sync: {
        Args: { p_company_id: string }
        Returns: undefined
      }
      update_qbo_tokens: {
        Args: {
          p_access_token: string
          p_company_id: string
          p_refresh_token: string
          p_token_expires_at: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      issue_priority: "low" | "med" | "high"
      issue_status: "open" | "in_progress" | "done" | "parked"
      meeting_type: "L10" | "quarterly" | "annual" | "ad_hoc"
      member_role: "owner" | "admin" | "coach" | "member" | "viewer"
      rock_status: "on_track" | "at_risk" | "off_track" | "done"
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
      issue_priority: ["low", "med", "high"],
      issue_status: ["open", "in_progress", "done", "parked"],
      meeting_type: ["L10", "quarterly", "annual", "ad_hoc"],
      member_role: ["owner", "admin", "coach", "member", "viewer"],
      rock_status: ["on_track", "at_risk", "off_track", "done"],
    },
  },
} as const
