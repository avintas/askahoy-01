export interface Project {
  id: string;
  user_id: string;
  business_name: string;
  contact_email: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  project_id: string;
  user_id: string;
  file_name: string;
  file_content: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

export interface TriviaQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  id?: string;
}

export interface TriviaExperience {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  questions: TriviaQuestion[];
  ai_generated: boolean;
  shareable_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsEvent {
  id: string;
  experience_id: string;
  project_id: string;
  user_id: string;
  event_type:
    | "view"
    | "start"
    | "complete"
    | "question_answer"
    | "quiz_complete";
  question_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type UserRole = "client" | "editor";
