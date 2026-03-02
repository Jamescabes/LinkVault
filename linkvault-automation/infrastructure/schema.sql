-- infrastructure/schema.sql
-- LinkVault Automation — Supabase schema

-- Páginas SEO generadas
CREATE TABLE IF NOT EXISTS seo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template TEXT NOT NULL,
  variable TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT,
  meta_description TEXT,
  h1 TEXT,
  content_sections JSONB,
  target_keyword TEXT,
  search_volume_est INTEGER,
  generated_at TIMESTAMP DEFAULT NOW(),
  deployed_at TIMESTAMP,
  published BOOLEAN DEFAULT false,
  visits INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0
);

-- Leads (betas + afiliados)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  company TEXT,
  role TEXT,
  platform TEXT,            -- 'youtube' | 'blog' | 'newsletter' | 'twitter'
  audience_size INTEGER,
  niche TEXT,
  profile_url TEXT,
  bio_summary TEXT,
  lead_type TEXT,           -- 'beta' | 'affiliate' | 'both'
  source TEXT,              -- 'apollo' | 'hunter' | 'youtube_api' | 'manual'
  status TEXT DEFAULT 'new', -- 'new' | 'sequence_ready' | 'contacted' | 'replied' | 'converted' | 'rejected'
  score INTEGER DEFAULT 0,  -- 0-100 lead scoring
  created_at TIMESTAMP DEFAULT NOW(),
  last_contact_at TIMESTAMP
);

-- Secuencias de email
CREATE TABLE IF NOT EXISTS email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  sequence_number INTEGER NOT NULL, -- 1, 2, 3
  subject TEXT,
  body TEXT,
  scheduled_for TIMESTAMP,
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  replied_at BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' -- 'pending' | 'sent' | 'opened' | 'replied'
);

-- Cola de contenido para redes
CREATE TABLE IF NOT EXISTS content_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,       -- 'twitter' | 'linkedin'
  content_type TEXT,            -- 'thread' | 'post' | 'article'
  topic TEXT,
  content JSONB,                -- array de tweets o texto de post
  scheduled_for TIMESTAMP,
  published_at TIMESTAMP,
  status TEXT DEFAULT 'pending',
  impressions INTEGER DEFAULT 0,
  engagements INTEGER DEFAULT 0
);

-- Métricas diarias
CREATE TABLE IF NOT EXISTS daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  seo_clicks INTEGER DEFAULT 0,
  seo_impressions INTEGER DEFAULT 0,
  seo_avg_position FLOAT DEFAULT 0,
  new_leads INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  email_open_rate FLOAT DEFAULT 0,
  email_reply_rate FLOAT DEFAULT 0,
  new_signups INTEGER DEFAULT 0,
  mrr FLOAT DEFAULT 0,
  social_impressions INTEGER DEFAULT 0,
  social_engagements INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_email_sequences_scheduled ON email_sequences(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_content_queue_scheduled ON content_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_seo_pages_published ON seo_pages(published);
