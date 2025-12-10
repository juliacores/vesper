// Database types will be generated from Supabase
// For now, defining basic structure

export interface User {
  id: string;
  email?: string;
  username?: string;
  pronouns?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  user_id: string;
  dynamic?: string;
  tone?: string;
  triggers?: string[];
  psychology?: string;
  hard_limits?: string[];
  safeword?: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  session_type: 'story' | 'audio' | 'voice';
  persona?: string;
  vibe?: string;
  title?: string;
  duration?: number;
  audio_url?: string;
  created_at: string;
}

