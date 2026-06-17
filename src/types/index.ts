export type UserRole = 'athlete' | 'scout' | 'club' | 'medical_partner' | 'federation' | 'admin' | 'guest';
export type SubscriptionTier = 'free' | 'pro' | 'elite' | 'enterprise';
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type ClearanceStatus = 'cleared' | 'restricted' | 'not_cleared' | 'pending';
export type RecommendationRelationship = 'coach' | 'teammate' | 'manager' | 'scout' | 'medical_staff' | 'colleague';

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  follower?: UserProfile;
  following?: UserProfile;
}

export interface Recommendation {
  id: string;
  author_id: string;
  recipient_id: string;
  relationship_type: RecommendationRelationship;
  body: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  author?: UserProfile;
  recipient?: UserProfile;
}

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  is_verified: boolean;
  subscription_tier: SubscriptionTier;
  created_at: string;
  updated_at: string;
}

export interface AthleteProfile {
  id: string;
  user_id: string;
  sport: string | null;
  position_primary: string | null;
  position_secondary: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  birth_date: string | null;
  nationality: string | null;
  dominant_foot: string | null;
  current_club: string | null;
  level: string;
  bio: string | null;
  is_open_to_offers: boolean;
  visibility_score: number;
  profile_completeness: number;
  highlighted_stats: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
}

export interface AthleteMedia {
  id: string;
  athlete_id: string;
  title: string;
  description: string | null;
  media_type: 'video' | 'image' | 'highlight_reel' | 'document';
  file_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  is_featured: boolean;
  is_public: boolean;
  views_count: number;
  ai_tags: string[];
  created_at: string;
}

export interface MatchRecord {
  id: string;
  athlete_id: string;
  match_date: string;
  opponent: string | null;
  competition: string | null;
  result: string | null;
  minutes_played: number | null;
  goals: number;
  assists: number;
  stats: Record<string, unknown>;
  notes: string | null;
  created_at: string;
}

export interface MedicalRecord {
  id: string;
  athlete_id: string;
  record_type: string;
  title: string | null;
  description: string | null;
  document_url: string | null;
  record_date: string;
  is_verified: boolean;
  hash: string | null;
  created_at: string;
}

export interface MedicalClearance {
  id: string;
  athlete_id: string;
  status: ClearanceStatus;
  issued_by: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface Endorsement {
  id: string;
  athlete_id: string;
  endorser_id: string;
  skill_or_trait: string;
  note: string | null;
  created_at: string;
  endorser?: UserProfile;
}

export interface Watchlist {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface WatchlistAthlete {
  id: string;
  watchlist_id: string;
  athlete_id: string;
  notes: string | null;
  rating: number | null;
  added_at: string;
  athlete?: AthleteProfile & { user?: UserProfile };
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  logo_url: string | null;
  description: string | null;
  country: string | null;
  city: string | null;
  website: string | null;
  is_verified: boolean;
  founded_year: number | null;
  created_at: string;
}

export interface Opportunity {
  id: string;
  organization_id: string | null;
  created_by_id: string;
  title: string;
  description: string | null;
  type: string | null;
  location: string | null;
  sport: string | null;
  position: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  application_deadline: string | null;
  is_active: boolean;
  created_at: string;
  organization?: Organization;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  created_at: string;
  other_user?: UserProfile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: UserProfile;
}

export interface AiChatSession {
  id: string;
  user_id: string;
  title: string | null;
  context_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface AiChatMessage {
  id: string;
  session_id: string;
  sender_role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface SuccessStory {
  id: string;
  title: string;
  content: string | null;
  athlete_name: string | null;
  sport: string | null;
  cover_image_url: string | null;
  is_featured: boolean;
  created_at: string;
}
