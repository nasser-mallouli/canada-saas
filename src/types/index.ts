export interface UserProfile {
  id: string;
  full_name: string;
  phone?: string;
  target_province?: string;
  target_city?: string;
  planned_arrival_date?: string;
  current_location?: string;
  immigration_status?: string;
  language_preference: string;
  notification_settings: Record<string, unknown>;
  role: 'user' | 'agent' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface CRSInputData {
  age: number;
  education: string;
  firstLanguage: {
    speaking: number;
    listening: number;
    reading: number;
    writing: number;
  };
  hasSecondLanguage: boolean;
  secondLanguage?: {
    speaking: number;
    listening: number;
    reading: number;
    writing: number;
  };
  canadianWorkExperience: string;
  foreignWorkExperience?: string;
  hasCertificateOfQualification?: boolean;
  hasSpouse: boolean;
  spouseData?: {
    education: string;
    language: {
      speaking: number;
      listening: number;
      reading: number;
      writing: number;
    };
    canadianWorkExperience: string;
  };
  provincialNomination: boolean;
  hasJobOffer: boolean;
  jobOfferDetails?: {
    teerCategory: string;
  };
  canadianEducation?: string;
  hasSiblingInCanada: boolean;
}

export interface CategoryBreakdown {
  coreHumanCapital: number;
  spousePartner: number;
  skillTransferability: number;
  additionalPoints: number;
}

export interface CRSCalculation {
  id: string;
  user_id?: string;
  calculation_date: string;
  score: number;
  category_breakdown: CategoryBreakdown;
  input_data: CRSInputData;
  is_latest: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Roadmap {
  id: string;
  calculation_id: string;
  user_id?: string;
  markdown_content: string;
  generation_date: string;
  llm_model_used?: string;
  satisfaction_rating?: number;
  regeneration_count: number;
  created_at: string;
  updated_at: string;
}

export type ServiceType = 'information_session' | 'settlement_support';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface ServiceBooking {
  id: string;
  user_id: string;
  service_type: ServiceType;
  booking_date: string;
  scheduled_datetime?: string;
  status: BookingStatus;
  assigned_agent_id?: string;
  selected_services: string[];
  pricing_details?: Record<string, unknown>;
  notes?: string;
  specific_topics?: string[];
  arrival_details?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ConsultationBooking {
  id: string;
  user_id: string;
  calculation_id?: string;
  consultation_type: string;
  consultant_id?: string;
  scheduled_datetime: string;
  duration_minutes: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  payment_status: 'pending' | 'paid' | 'refunded';
  meeting_link?: string;
  recording_url?: string;
  summary?: string;
  questions?: string;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceWaitlist {
  id: string;
  user_id?: string;
  email: string;
  service_types: string[];
  signup_date: string;
  notified: boolean;
  preferences: Record<string, unknown>;
  created_at: string;
}

export interface AgentNote {
  id: string;
  booking_id?: string;
  agent_id: string;
  note_content: string;
  note_type: 'consultation' | 'follow_up' | 'internal';
  is_private: boolean;
  created_at: string;
  updated_at: string;
}
