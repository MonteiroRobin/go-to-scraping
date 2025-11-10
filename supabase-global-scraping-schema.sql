-- SCHEMA FOR GLOBAL SCRAPING DATABASE WITH DEDUPLICATION

-- ============================================
-- 1. GLOBAL BUSINESSES TABLE (shared, anonymized)
-- ============================================
CREATE TABLE IF NOT EXISTS global_businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Google Places unique identifier
  place_id TEXT UNIQUE NOT NULL,

  -- Business data
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  website TEXT,
  email TEXT,

  -- Location
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,

  -- Google data
  rating DOUBLE PRECISION,
  user_ratings_total INTEGER,
  price_level INTEGER,
  business_status TEXT,
  types TEXT[],
  opening_hours JSONB,
  photos TEXT[],

  -- Enrichment data
  description TEXT,
  category TEXT,
  tags TEXT[],
  enriched BOOLEAN DEFAULT false,

  -- Metadata for freshness
  first_scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scrape_count INTEGER DEFAULT 1,
  data_quality_score INTEGER DEFAULT 50, -- 0-100

  -- Indexes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_global_businesses_place_id ON global_businesses(place_id);
CREATE INDEX IF NOT EXISTS idx_global_businesses_location ON global_businesses(lat, lon);
CREATE INDEX IF NOT EXISTS idx_global_businesses_updated ON global_businesses(last_updated_at);
CREATE INDEX IF NOT EXISTS idx_global_businesses_rating ON global_businesses(rating);

-- ============================================
-- 2. USER SEARCHES (private, per user)
-- ============================================
CREATE TABLE IF NOT EXISTS user_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Search parameters
  search_name TEXT, -- Optional user-given name
  city TEXT NOT NULL,
  business_type TEXT,
  keywords TEXT,

  -- Location searched
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  radius INTEGER DEFAULT 5000,

  -- Results reference (array of business IDs)
  business_ids UUID[] DEFAULT '{}',
  result_count INTEGER DEFAULT 0,

  -- Cache info
  was_cached BOOLEAN DEFAULT false,
  cache_freshness TEXT, -- 'fresh', 'stale', 'new'

  -- Credits consumed
  credits_used INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_searches_user_id ON user_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_user_searches_created ON user_searches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_searches_location ON user_searches(city, business_type);

-- ============================================
-- 3. SCRAPING JOBS QUEUE (async processing)
-- ============================================
CREATE TABLE IF NOT EXISTS scraping_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Job details
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  search_params JSONB NOT NULL,

  -- Progress tracking
  progress_current INTEGER DEFAULT 0,
  progress_total INTEGER DEFAULT 0,

  -- Results
  search_id UUID REFERENCES user_searches(id),
  new_businesses_count INTEGER DEFAULT 0,
  cached_businesses_count INTEGER DEFAULT 0,

  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_scraping_jobs_user_status ON scraping_jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);

-- ============================================
-- 4. USER CREDITS (for business model)
-- ============================================
CREATE TABLE IF NOT EXISTS user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  credits_remaining INTEGER DEFAULT 100, -- Free tier
  credits_total INTEGER DEFAULT 100,
  credits_used INTEGER DEFAULT 0,

  -- Subscription
  plan TEXT DEFAULT 'free', -- free, starter, pro, enterprise

  -- Timestamps
  last_refill_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- ============================================
-- 5. FUNCTIONS FOR SMART SCRAPING
-- ============================================

-- Function: Check if businesses exist in cache
CREATE OR REPLACE FUNCTION check_cache_freshness(
  search_city TEXT,
  search_type TEXT,
  search_lat DOUBLE PRECISION,
  search_lon DOUBLE PRECISION,
  search_radius INTEGER
)
RETURNS TABLE (
  cache_status TEXT,
  cached_count INTEGER,
  freshness_days DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN COUNT(*) > 0 AND AVG(EXTRACT(EPOCH FROM (NOW() - last_updated_at))/86400) < 7 THEN 'fresh'
      WHEN COUNT(*) > 0 AND AVG(EXTRACT(EPOCH FROM (NOW() - last_updated_at))/86400) < 30 THEN 'stale'
      ELSE 'none'
    END as cache_status,
    COUNT(*)::INTEGER as cached_count,
    AVG(EXTRACT(EPOCH FROM (NOW() - last_updated_at))/86400) as freshness_days
  FROM global_businesses
  WHERE
    -- Location-based search (simplified - use PostGIS for production)
    lat BETWEEN search_lat - (search_radius::DOUBLE PRECISION/111000)
            AND search_lat + (search_radius::DOUBLE PRECISION/111000)
    AND lon BETWEEN search_lon - (search_radius::DOUBLE PRECISION/111000)
                AND search_lon + (search_radius::DOUBLE PRECISION/111000);
END;
$$ LANGUAGE plpgsql;

-- Function: Upsert business (insert or update if exists)
CREATE OR REPLACE FUNCTION upsert_business(
  p_place_id TEXT,
  p_name TEXT,
  p_address TEXT,
  p_phone TEXT,
  p_website TEXT,
  p_email TEXT,
  p_lat DOUBLE PRECISION,
  p_lon DOUBLE PRECISION,
  p_rating DOUBLE PRECISION,
  p_user_ratings_total INTEGER,
  p_price_level INTEGER,
  p_business_status TEXT,
  p_types TEXT[],
  p_opening_hours JSONB,
  p_photos TEXT[]
)
RETURNS UUID AS $$
DECLARE
  business_id UUID;
BEGIN
  INSERT INTO global_businesses (
    place_id, name, address, phone, website, email,
    lat, lon, rating, user_ratings_total, price_level,
    business_status, types, opening_hours, photos
  ) VALUES (
    p_place_id, p_name, p_address, p_phone, p_website, p_email,
    p_lat, p_lon, p_rating, p_user_ratings_total, p_price_level,
    p_business_status, p_types, p_opening_hours, p_photos
  )
  ON CONFLICT (place_id)
  DO UPDATE SET
    name = EXCLUDED.name,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone,
    website = EXCLUDED.website,
    email = EXCLUDED.email,
    rating = EXCLUDED.rating,
    user_ratings_total = EXCLUDED.user_ratings_total,
    price_level = EXCLUDED.price_level,
    business_status = EXCLUDED.business_status,
    types = EXCLUDED.types,
    opening_hours = EXCLUDED.opening_hours,
    photos = EXCLUDED.photos,
    last_updated_at = NOW(),
    scrape_count = global_businesses.scrape_count + 1
  RETURNING id INTO business_id;

  RETURN business_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE user_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- global_businesses is READ-ONLY for all authenticated users
ALTER TABLE global_businesses ENABLE ROW LEVEL SECURITY;

-- Policies for user_searches
CREATE POLICY "Users can view own searches"
  ON user_searches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own searches"
  ON user_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies for scraping_jobs
CREATE POLICY "Users can view own jobs"
  ON scraping_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs"
  ON scraping_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies for global_businesses (read-only)
CREATE POLICY "Authenticated users can read businesses"
  ON global_businesses FOR SELECT
  TO authenticated
  USING (true);

-- Policies for user_credits
CREATE POLICY "Users can view own credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- 7. TRIGGERS
-- ============================================

-- Trigger: Auto-create credits for new users
CREATE OR REPLACE FUNCTION create_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_credits (user_id, credits_remaining, credits_total)
  VALUES (NEW.id, 100, 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_credits();

-- ============================================
-- 8. VIEWS FOR ANALYTICS
-- ============================================

-- View: User search history with cache info
CREATE OR REPLACE VIEW user_search_history AS
SELECT
  us.id,
  us.user_id,
  us.search_name,
  us.city,
  us.business_type,
  us.result_count,
  us.was_cached,
  us.cache_freshness,
  us.credits_used,
  us.created_at,
  array_length(us.business_ids, 1) as businesses_found
FROM user_searches us
ORDER BY us.created_at DESC;

-- View: Global statistics (anonymized)
CREATE OR REPLACE VIEW global_statistics AS
SELECT
  COUNT(DISTINCT place_id) as total_unique_businesses,
  COUNT(*) as total_scrapes,
  AVG(rating) as avg_rating,
  COUNT(CASE WHEN last_updated_at > NOW() - INTERVAL '7 days' THEN 1 END) as fresh_data_count,
  COUNT(CASE WHEN last_updated_at > NOW() - INTERVAL '30 days' THEN 1 END) as recent_data_count
FROM global_businesses;

COMMENT ON TABLE global_businesses IS 'Shared pool of all scraped businesses (anonymized)';
COMMENT ON TABLE user_searches IS 'User-specific search history (private)';
COMMENT ON TABLE scraping_jobs IS 'Async job queue for background scraping';
COMMENT ON TABLE user_credits IS 'Credit system for business model';
