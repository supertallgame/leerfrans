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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_applications: {
        Row: {
          created_at: string
          id: string
          motivation: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_email: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          motivation: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_email: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          motivation?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_chat_messages: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          message: string
          sender_display: string
          sender_email: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          message: string
          sender_display: string
          sender_email: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          message?: string
          sender_display?: string
          sender_email?: string
          sender_id?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      anonymous_bug_reports: {
        Row: {
          category: string
          created_at: string
          id: string
          message: string
          status: string
          subject: string
          username: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          message: string
          status?: string
          subject: string
          username: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          message?: string
          status?: string
          subject?: string
          username?: string
        }
        Relationships: []
      }
      direct_chats: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          updated_at: string
          user_display_name: string | null
          user_email: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id: string
          updated_at?: string
          user_display_name?: string | null
          user_email: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          updated_at?: string
          user_display_name?: string | null
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          body: string
          chat_id: string
          created_at: string
          id: string
          read_by_owner: boolean
          read_by_user: boolean
          sender_id: string
          sender_is_owner: boolean
        }
        Insert: {
          body: string
          chat_id: string
          created_at?: string
          id?: string
          read_by_owner?: boolean
          read_by_user?: boolean
          sender_id: string
          sender_is_owner?: boolean
        }
        Update: {
          body?: string
          chat_id?: string
          created_at?: string
          id?: string
          read_by_owner?: boolean
          read_by_user?: boolean
          sender_id?: string
          sender_is_owner?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "direct_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      game_answers: {
        Row: {
          chapter_id: string
          correct_answer: string
          created_at: string
          game_type: string
          given_answer: string | null
          id: string
          is_correct: boolean
          language: string
          question: string
          session_id: string
          user_id: string | null
        }
        Insert: {
          chapter_id: string
          correct_answer: string
          created_at?: string
          game_type: string
          given_answer?: string | null
          id?: string
          is_correct?: boolean
          language: string
          question: string
          session_id: string
          user_id?: string | null
        }
        Update: {
          chapter_id?: string
          correct_answer?: string
          created_at?: string
          game_type?: string
          given_answer?: string | null
          id?: string
          is_correct?: boolean
          language?: string
          question?: string
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      game_players: {
        Row: {
          current_answer: string | null
          eliminated: boolean
          has_answered: boolean
          id: string
          joined_at: string
          last_active: string
          player_name: string
          player_token: string
          room_id: string
          score: number
          team_number: number | null
        }
        Insert: {
          current_answer?: string | null
          eliminated?: boolean
          has_answered?: boolean
          id?: string
          joined_at?: string
          last_active?: string
          player_name: string
          player_token?: string
          room_id: string
          score?: number
          team_number?: number | null
        }
        Update: {
          current_answer?: string | null
          eliminated?: boolean
          has_answered?: boolean
          id?: string
          joined_at?: string
          last_active?: string
          player_name?: string
          player_token?: string
          room_id?: string
          score?: number
          team_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "game_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "game_rooms_public"
            referencedColumns: ["id"]
          },
        ]
      }
      game_questions: {
        Row: {
          created_at: string
          id: string
          questions: Json
          room_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          questions?: Json
          room_id: string
        }
        Update: {
          created_at?: string
          id?: string
          questions?: Json
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_questions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: true
            referencedRelation: "game_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_questions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: true
            referencedRelation: "game_rooms_public"
            referencedColumns: ["id"]
          },
        ]
      }
      game_rooms: {
        Row: {
          code: string
          created_at: string
          current_question_index: number
          direction: string
          game_mode: string
          host_name: string
          host_player_id: string | null
          id: string
          is_public: boolean
          kahoot_timer: number
          max_players: number
          num_teams: number
          question_started_at: string | null
          quiz_chapter_id: string
          quiz_language: string
          quiz_sections: Json
          status: string
          team_emojis: Json
          team_mode: string
          team_names: Json
          total_questions: number
        }
        Insert: {
          code: string
          created_at?: string
          current_question_index?: number
          direction?: string
          game_mode?: string
          host_name: string
          host_player_id?: string | null
          id?: string
          is_public?: boolean
          kahoot_timer?: number
          max_players?: number
          num_teams?: number
          question_started_at?: string | null
          quiz_chapter_id?: string
          quiz_language?: string
          quiz_sections?: Json
          status?: string
          team_emojis?: Json
          team_mode?: string
          team_names?: Json
          total_questions?: number
        }
        Update: {
          code?: string
          created_at?: string
          current_question_index?: number
          direction?: string
          game_mode?: string
          host_name?: string
          host_player_id?: string | null
          id?: string
          is_public?: boolean
          kahoot_timer?: number
          max_players?: number
          num_teams?: number
          question_started_at?: string | null
          quiz_chapter_id?: string
          quiz_language?: string
          quiz_sections?: Json
          status?: string
          team_emojis?: Json
          team_mode?: string
          team_names?: Json
          total_questions?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_rooms_host_player_id_fkey"
            columns: ["host_player_id"]
            isOneToOne: false
            referencedRelation: "game_players"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_bans: {
        Row: {
          banned_by: string
          created_at: string
          id: string
          ip_address: string
          is_mute: boolean | null
          mute_until: string | null
          reason: string | null
        }
        Insert: {
          banned_by: string
          created_at?: string
          id?: string
          ip_address: string
          is_mute?: boolean | null
          mute_until?: string | null
          reason?: string | null
        }
        Update: {
          banned_by?: string
          created_at?: string
          id?: string
          ip_address?: string
          is_mute?: boolean | null
          mute_until?: string | null
          reason?: string | null
        }
        Relationships: []
      }
      juf_notes: {
        Row: {
          created_at: string
          filters: Json
          id: string
          note: string
          user_email: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          note: string
          user_email: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          note?: string
          user_email?: string
        }
        Relationships: []
      }
      leadership_chat_messages: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          message: string
          sender_display: string
          sender_email: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          message: string
          sender_display: string
          sender_email: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          message?: string
          sender_display?: string
          sender_email?: string
          sender_id?: string
        }
        Relationships: []
      }
      muted_users: {
        Row: {
          created_at: string
          id: string
          muted_until: string
          reason: string | null
          user_email: string
        }
        Insert: {
          created_at?: string
          id?: string
          muted_until: string
          reason?: string | null
          user_email: string
        }
        Update: {
          created_at?: string
          id?: string
          muted_until?: string
          reason?: string | null
          user_email?: string
        }
        Relationships: []
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          poll_id: string
          selected_option: string
          user_id: string
          voter_email: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          poll_id: string
          selected_option: string
          user_id: string
          voter_email?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          poll_id?: string
          selected_option?: string
          user_id?: string
          voter_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "update_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      review_replies: {
        Row: {
          created_at: string
          display_name: string
          id: string
          message: string
          review_id: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          message: string
          review_id: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          message?: string
          review_id?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_replies_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_replies_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews_public"
            referencedColumns: ["id"]
          },
        ]
      }
      review_votes: {
        Row: {
          created_at: string
          id: string
          review_id: string
          vote_type: string
          voter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          review_id: string
          vote_type: string
          voter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          review_id?: string
          vote_type?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews_public"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string
          display_name: string
          id: string
          image_url: string | null
          message: string
          rating: number
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          image_url?: string | null
          message: string
          rating: number
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          image_url?: string | null
          message?: string
          rating?: number
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      staff_action_logs: {
        Row: {
          action: string
          actor_email: string
          actor_role: string
          actor_user_id: string | null
          created_at: string
          details: Json
          id: string
          target: string | null
        }
        Insert: {
          action: string
          actor_email: string
          actor_role: string
          actor_user_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target?: string | null
        }
        Update: {
          action?: string
          actor_email?: string
          actor_role?: string
          actor_user_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target?: string | null
        }
        Relationships: []
      }
      staff_warnings: {
        Row: {
          acknowledged_at: string | null
          created_at: string
          id: string
          reason: string
          recipient_email: string
          recipient_id: string
          role_target: string
          sender_email: string
          sender_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          created_at?: string
          id?: string
          reason: string
          recipient_email: string
          recipient_id: string
          role_target: string
          sender_email: string
          sender_id: string
        }
        Update: {
          acknowledged_at?: string | null
          created_at?: string
          id?: string
          reason?: string
          recipient_email?: string
          recipient_id?: string
          role_target?: string
          sender_email?: string
          sender_id?: string
        }
        Relationships: []
      }
      support_report_messages: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          message: string
          report_id: string
          sender_email: string
          sender_id: string
          sender_role: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          message: string
          report_id: string
          sender_email: string
          sender_id: string
          sender_role?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          message?: string
          report_id?: string
          sender_email?: string
          sender_id?: string
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_report_messages_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "support_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      support_reports: {
        Row: {
          category: string
          closed_at: string | null
          closed_by: string | null
          created_at: string
          id: string
          status: string
          subject: string
          updated_at: string
          user_email: string
          user_id: string
        }
        Insert: {
          category?: string
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          id?: string
          status?: string
          subject: string
          updated_at?: string
          user_email: string
          user_id: string
        }
        Update: {
          category?: string
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          id?: string
          status?: string
          subject?: string
          updated_at?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      update_announcements: {
        Row: {
          created_at: string
          created_by: string
          id: string
          image_url: string | null
          is_active: boolean
          message: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          message: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          message?: string
        }
        Relationships: []
      }
      update_polls: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          options: Json
          question: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          options?: Json
          question: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          options?: Json
          question?: string
        }
        Relationships: []
      }
      user_bans: {
        Row: {
          ban_type: string
          banned_by: string
          created_at: string
          id: string
          mute_until: string | null
          reason: string | null
          user_email: string
        }
        Insert: {
          ban_type?: string
          banned_by: string
          created_at?: string
          id?: string
          mute_until?: string | null
          reason?: string | null
          user_email: string
        }
        Update: {
          ban_type?: string
          banned_by?: string
          created_at?: string
          id?: string
          mute_until?: string | null
          reason?: string | null
          user_email?: string
        }
        Relationships: []
      }
      user_ips: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: string
          ip_address: string
          is_vpn: boolean | null
          last_seen_at: string
          user_email: string
          user_id: string | null
          vpn_provider: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          ip_address: string
          is_vpn?: boolean | null
          last_seen_at?: string
          user_email: string
          user_id?: string | null
          vpn_provider?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          ip_address?: string
          is_vpn?: boolean | null
          last_seen_at?: string
          user_email?: string
          user_id?: string | null
          vpn_provider?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      game_rooms_public: {
        Row: {
          code: string | null
          created_at: string | null
          current_question_index: number | null
          direction: string | null
          game_mode: string | null
          host_name: string | null
          id: string | null
          is_public: boolean | null
          kahoot_timer: number | null
          num_teams: number | null
          quiz_chapter_id: string | null
          quiz_language: string | null
          quiz_sections: Json | null
          status: string | null
          team_emojis: Json | null
          team_mode: string | null
          team_names: Json | null
          total_questions: number | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          current_question_index?: number | null
          direction?: string | null
          game_mode?: string | null
          host_name?: string | null
          id?: string | null
          is_public?: boolean | null
          kahoot_timer?: number | null
          num_teams?: number | null
          quiz_chapter_id?: string | null
          quiz_language?: string | null
          quiz_sections?: Json | null
          status?: string | null
          team_emojis?: Json | null
          team_mode?: string | null
          team_names?: Json | null
          total_questions?: number | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          current_question_index?: number | null
          direction?: string | null
          game_mode?: string | null
          host_name?: string | null
          id?: string | null
          is_public?: boolean | null
          kahoot_timer?: number | null
          num_teams?: number | null
          quiz_chapter_id?: string | null
          quiz_language?: string | null
          quiz_sections?: Json | null
          status?: string | null
          team_emojis?: Json | null
          team_mode?: string | null
          team_names?: Json | null
          total_questions?: number | null
        }
        Relationships: []
      }
      reviews_public: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string | null
          image_url: string | null
          message: string | null
          rating: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          image_url?: string | null
          message?: string | null
          rating?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          image_url?: string | null
          message?: string | null
          rating?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_ip_ban: { Args: { p_ip: string }; Returns: boolean }
      check_user_ban: {
        Args: { p_email: string }
        Returns: {
          ban_type: string
          is_banned: boolean
          mute_until: string
          reason: string
        }[]
      }
      create_direct_chat: { Args: { p_user_email: string }; Returns: string }
      create_game_room:
        | {
            Args: {
              p_code: string
              p_game_mode?: string
              p_host_name: string
              p_num_teams?: number
              p_team_emojis?: Json
              p_team_mode?: string
              p_team_names?: Json
              p_total_questions?: number
            }
            Returns: Json
          }
        | {
            Args: {
              p_code: string
              p_game_mode?: string
              p_host_name: string
              p_is_public?: boolean
              p_max_players?: number
              p_num_teams?: number
              p_team_emojis?: Json
              p_team_mode?: string
              p_team_names?: Json
              p_total_questions?: number
            }
            Returns: Json
          }
        | {
            Args: {
              p_code: string
              p_game_mode?: string
              p_host_name: string
              p_is_public?: boolean
              p_kahoot_timer?: number
              p_max_players?: number
              p_num_teams?: number
              p_team_emojis?: Json
              p_team_mode?: string
              p_team_names?: Json
              p_total_questions?: number
            }
            Returns: Json
          }
        | {
            Args: {
              p_code: string
              p_game_mode?: string
              p_host_name: string
              p_is_public?: boolean
              p_kahoot_timer?: number
              p_max_players?: number
              p_num_teams?: number
              p_quiz_chapter_id?: string
              p_quiz_language?: string
              p_quiz_sections?: Json
              p_team_emojis?: Json
              p_team_mode?: string
              p_team_names?: Json
              p_total_questions?: number
            }
            Returns: Json
          }
      find_user_by_email: { Args: { p_email: string }; Returns: string }
      get_admin_emails: { Args: never; Returns: string[] }
      get_my_mute_status: {
        Args: never
        Returns: {
          muted_until: string
        }[]
      }
      get_my_staff_role: { Args: never; Returns: string }
      get_public_rooms: {
        Args: never
        Returns: {
          code: string
          created_at: string
          game_mode: string
          host_name: string
          id: string
          max_players: number
          num_teams: number
          player_count: number
          team_mode: string
        }[]
      }
      get_public_setting: { Args: { p_key: string }; Returns: Json }
      get_public_settings_bulk: { Args: never; Returns: Json }
      get_review_replies_public: {
        Args: never
        Returns: {
          created_at: string
          display_name: string
          id: string
          message: string
          review_id: string
          user_id: string
        }[]
      }
      get_review_vote_counts: {
        Args: never
        Returns: {
          dislikes: number
          likes: number
          review_id: string
        }[]
      }
      get_reviews_admin: {
        Args: never
        Returns: {
          created_at: string
          display_name: string
          id: string
          message: string
          rating: number
          user_email: string
        }[]
      }
      get_room_players: {
        Args: { p_room_id: string }
        Returns: {
          eliminated: boolean
          has_answered: boolean
          id: string
          joined_at: string
          player_name: string
          room_id: string
          score: number
          team_number: number
        }[]
      }
      get_staff_user_roles: {
        Args: { _user_ids: string[] }
        Returns: {
          role: string
          user_id: string
        }[]
      }
      has_open_report: { Args: never; Returns: boolean }
      is_head_admin: { Args: { _user_id: string }; Returns: boolean }
      is_head_tester: { Args: { _user_id: string }; Returns: boolean }
      is_leadership: { Args: { _user_id: string }; Returns: boolean }
      is_owner: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      is_tester: { Args: { _user_id: string }; Returns: boolean }
      join_game_room: {
        Args: { p_player_name: string; p_room_id: string }
        Returns: Json
      }
      list_all_users: {
        Args: never
        Returns: {
          created_at: string
          email: string
          id: string
        }[]
      }
      upsert_site_rules: { Args: { p_rules: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
