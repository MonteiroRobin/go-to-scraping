-- Table: articles
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  category TEXT,
  image_url TEXT,
  author TEXT,
  tags TEXT,
  views INT4 DEFAULT 0,
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ
);

-- Table: article_images
CREATE TABLE IF NOT EXISTS public.article_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  file_name TEXT,
  file_size INT4,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: comments
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: newsletter_subscribers
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  status TEXT DEFAULT 'active',
  preferences TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON public.articles(published);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_article_images_article_id ON public.article_images(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON public.comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON public.comments(approved);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscribers(email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for articles (public read, authenticated write)
CREATE POLICY "Articles are viewable by everyone"
  ON public.articles FOR SELECT
  USING (published = true OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert articles"
  ON public.articles FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update articles"
  ON public.articles FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete articles"
  ON public.articles FOR DELETE
  USING (auth.role() = 'authenticated');

-- RLS Policies for article_images
CREATE POLICY "Article images are viewable by everyone"
  ON public.article_images FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage article images"
  ON public.article_images FOR ALL
  USING (auth.role() = 'authenticated');

-- RLS Policies for comments
CREATE POLICY "Approved comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING (approved = true OR auth.role() = 'authenticated');

CREATE POLICY "Anyone can insert comments"
  ON public.comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update comments"
  ON public.comments FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete comments"
  ON public.comments FOR DELETE
  USING (auth.role() = 'authenticated');

-- RLS Policies for newsletter_subscribers
CREATE POLICY "Only authenticated users can view subscribers"
  ON public.newsletter_subscribers FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Subscribers can update their own data"
  ON public.newsletter_subscribers FOR UPDATE
  USING (email = auth.jwt()->>'email' OR auth.role() = 'authenticated');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_updated_at
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
