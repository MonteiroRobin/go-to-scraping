-- Analytics pour Go To Scraping
-- Track les recherches, résultats, exports et utilisation

-- Table pour tracker les recherches
CREATE TABLE IF NOT EXISTS search_analytics (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  search_query TEXT NOT NULL,
  city_detected TEXT,
  business_type TEXT,
  results_count INTEGER DEFAULT 0,
  cached_results INTEGER DEFAULT 0,
  new_results INTEGER DEFAULT 0,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  zone_size_km2 DECIMAL(10, 2),
  search_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour tracker les exports
CREATE TABLE IF NOT EXISTS export_analytics (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  search_id BIGINT REFERENCES search_analytics(id),
  export_type TEXT NOT NULL, -- 'csv' ou 'sheets'
  results_exported INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour tracker l'enrichissement AI
CREATE TABLE IF NOT EXISTS enrichment_analytics (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  search_id BIGINT REFERENCES search_analytics(id),
  businesses_enriched INTEGER NOT NULL,
  credits_used INTEGER NOT NULL,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_search_analytics_user_id ON search_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_search_analytics_created_at ON search_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_analytics_city ON search_analytics(city_detected);
CREATE INDEX IF NOT EXISTS idx_export_analytics_user_id ON export_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_enrichment_analytics_user_id ON enrichment_analytics(user_id);

-- Vue pour statistiques globales
CREATE OR REPLACE VIEW global_stats AS
SELECT
  COUNT(DISTINCT user_id) as total_users,
  COUNT(*) as total_searches,
  SUM(results_count) as total_results,
  SUM(cached_results) as total_cached,
  SUM(new_results) as total_new,
  AVG(search_duration_ms) as avg_search_duration,
  COUNT(DISTINCT city_detected) as cities_searched
FROM search_analytics
WHERE created_at > NOW() - INTERVAL '30 days';

-- Vue pour top villes
CREATE OR REPLACE VIEW top_cities AS
SELECT
  city_detected,
  COUNT(*) as search_count,
  SUM(results_count) as total_results,
  AVG(results_count) as avg_results
FROM search_analytics
WHERE city_detected IS NOT NULL
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY city_detected
ORDER BY search_count DESC
LIMIT 10;

-- Vue pour top types de commerces
CREATE OR REPLACE VIEW top_business_types AS
SELECT
  business_type,
  COUNT(*) as search_count,
  SUM(results_count) as total_results
FROM search_analytics
WHERE business_type IS NOT NULL
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY business_type
ORDER BY search_count DESC
LIMIT 10;

COMMENT ON TABLE search_analytics IS 'Track toutes les recherches effectuées';
COMMENT ON TABLE export_analytics IS 'Track tous les exports (CSV/Sheets)';
COMMENT ON TABLE enrichment_analytics IS 'Track tous les enrichissements AI';
