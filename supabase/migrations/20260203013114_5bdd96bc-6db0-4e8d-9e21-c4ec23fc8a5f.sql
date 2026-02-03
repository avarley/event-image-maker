-- Create shared_templates table
CREATE TABLE public.shared_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  author_name TEXT,
  text_config JSONB NOT NULL,
  text_enabled BOOLEAN NOT NULL DEFAULT true,
  overlay_metadata JSONB,
  baseplate_url TEXT,
  overlay_urls TEXT[],
  downloads_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.shared_templates ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read shared templates
CREATE POLICY "Anyone can view shared templates"
  ON public.shared_templates
  FOR SELECT
  USING (true);

-- Allow anyone to insert shared templates (anonymous publishing)
CREATE POLICY "Anyone can publish templates"
  ON public.shared_templates
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to increment download count
CREATE POLICY "Anyone can update download count"
  ON public.shared_templates
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for shared templates
INSERT INTO storage.buckets (id, name, public)
VALUES ('shared-templates', 'shared-templates', true);

-- Allow public read access to shared template files
CREATE POLICY "Public can view shared template files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'shared-templates');

-- Allow anyone to upload to shared templates bucket
CREATE POLICY "Anyone can upload shared template files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'shared-templates');