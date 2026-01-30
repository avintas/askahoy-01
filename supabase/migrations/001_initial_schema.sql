-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE aska_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE aska_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES aska_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_content TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trivia experiences table
CREATE TABLE aska_trivia_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES aska_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_generated BOOLEAN DEFAULT true,
  shareable_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics events table
CREATE TABLE aska_analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experience_id UUID NOT NULL REFERENCES aska_trivia_experiences(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES aska_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'start', 'complete', 'question_answer', 'quiz_complete')),
  question_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_aska_projects_user_id ON aska_projects(user_id);
CREATE INDEX idx_aska_documents_project_id ON aska_documents(project_id);
CREATE INDEX idx_aska_documents_user_id ON aska_documents(user_id);
CREATE INDEX idx_aska_trivia_experiences_project_id ON aska_trivia_experiences(project_id);
CREATE INDEX idx_aska_trivia_experiences_user_id ON aska_trivia_experiences(user_id);
CREATE INDEX idx_aska_analytics_events_experience_id ON aska_analytics_events(experience_id);
CREATE INDEX idx_aska_analytics_events_project_id ON aska_analytics_events(project_id);
CREATE INDEX idx_aska_analytics_events_user_id ON aska_analytics_events(user_id);
CREATE INDEX idx_aska_analytics_events_created_at ON aska_analytics_events(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_aska_projects_updated_at
  BEFORE UPDATE ON aska_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aska_trivia_experiences_updated_at
  BEFORE UPDATE ON aska_trivia_experiences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE aska_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE aska_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE aska_trivia_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE aska_analytics_events ENABLE ROW LEVEL SECURITY;

-- Projects policies
-- Users can view their own projects
CREATE POLICY "Users can view own aska projects"
  ON aska_projects FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own projects
CREATE POLICY "Users can insert own aska projects"
  ON aska_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "Users can update own aska projects"
  ON aska_projects FOR UPDATE
  USING (auth.uid() = user_id);

-- Documents policies
-- Users can view documents for their projects
CREATE POLICY "Users can view own aska documents"
  ON aska_documents FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert documents for their projects
CREATE POLICY "Users can insert own aska documents"
  ON aska_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trivia experiences policies
-- Users can view trivia experiences for their projects
CREATE POLICY "Users can view own aska trivia experiences"
  ON aska_trivia_experiences FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert trivia experiences for their projects
CREATE POLICY "Users can insert own aska trivia experiences"
  ON aska_trivia_experiences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update trivia experiences for their projects
CREATE POLICY "Users can update own aska trivia experiences"
  ON aska_trivia_experiences FOR UPDATE
  USING (auth.uid() = user_id);

-- Analytics events policies
-- Users can view analytics for their projects
CREATE POLICY "Users can view own aska analytics"
  ON aska_analytics_events FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can insert analytics events (for public trivia pages)
CREATE POLICY "Anyone can insert aska analytics events"
  ON aska_analytics_events FOR INSERT
  WITH CHECK (true);

-- Public access to trivia experiences (for /play/[id] pages)
CREATE POLICY "Public can view published aska trivia experiences"
  ON aska_trivia_experiences FOR SELECT
  USING (shareable_url IS NOT NULL);
