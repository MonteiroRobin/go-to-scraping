-- ========================================
-- SYSTÈME DE CRÉDITS ANTI-TRICHE
-- ========================================
-- Ce fichier améliore le système de crédits avec :
-- - Transactions atomiques
-- - Audit trail complet
-- - Limites journalières
-- - Détection de duplication
-- - Protection contre les race conditions

-- 1. Enrichir la table user_credits
ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'business', 'enterprise'));

ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS
  daily_usage INTEGER DEFAULT 0;

ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS
  last_daily_reset TIMESTAMP DEFAULT NOW();

ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS
  stripe_customer_id TEXT;

ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS
  stripe_subscription_id TEXT;

ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS
  subscription_status TEXT DEFAULT 'active';

ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS
  updated_at TIMESTAMP DEFAULT NOW();

-- 2. Table d'audit des transactions (immuable)
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Positif = ajout, Négatif = déduction
  type TEXT NOT NULL CHECK (type IN (
    'scraping_new',
    'scraping_cache_fresh',
    'scraping_cache_stale',
    'enrichment_grok',
    'export_csv',
    'export_sheets',
    'purchase',
    'refund',
    'bonus'
  )),
  operation_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  credits_before INTEGER NOT NULL,
  credits_after INTEGER NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user
  ON credit_transactions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_type
  ON credit_transactions(type, created_at DESC);

-- 3. Table de détection de duplication
CREATE TABLE IF NOT EXISTS search_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  search_hash TEXT NOT NULL, -- SHA256(city+type+radius+keywords)
  search_params JSONB NOT NULL,
  last_search_at TIMESTAMP DEFAULT NOW(),
  search_count INTEGER DEFAULT 1,
  UNIQUE(user_id, search_hash)
);

CREATE INDEX IF NOT EXISTS idx_search_fingerprints_user
  ON search_fingerprints(user_id, last_search_at DESC);

-- 4. Fonction de déduction atomique des crédits
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_details JSONB DEFAULT '{}'::jsonb,
  p_ip TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_credits_before INTEGER;
  v_credits_after INTEGER;
  v_daily_limit INTEGER;
  v_daily_usage INTEGER;
  v_plan TEXT;
  v_last_reset TIMESTAMP;
BEGIN
  -- Lock user row pour éviter race conditions (CRUCIAL)
  SELECT credits_remaining, plan, daily_usage, last_daily_reset
  INTO v_credits_before, v_plan, v_daily_usage, v_last_reset
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE; -- Verrou pessimiste

  -- Vérifier si user existe
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found',
      'error_code', 'USER_NOT_FOUND'
    );
  END IF;

  -- Reset daily counter si nouveau jour
  IF v_last_reset::date < NOW()::date THEN
    v_daily_usage := 0;
    UPDATE user_credits
    SET daily_usage = 0, last_daily_reset = NOW()
    WHERE user_id = p_user_id;
  END IF;

  -- Limites journalières par plan
  v_daily_limit := CASE v_plan
    WHEN 'free' THEN 50
    WHEN 'starter' THEN 200
    WHEN 'pro' THEN 1000
    WHEN 'business' THEN 5000
    WHEN 'enterprise' THEN 999999
    ELSE 50 -- Par défaut = free
  END;

  -- Vérifier limite journalière
  IF v_daily_usage + p_amount > v_daily_limit THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Daily credit limit reached',
      'error_code', 'DAILY_LIMIT_EXCEEDED',
      'daily_usage', v_daily_usage,
      'daily_limit', v_daily_limit,
      'reset_at', (v_last_reset + INTERVAL '1 day')::text
    );
  END IF;

  -- Vérifier crédits suffisants
  IF v_credits_before < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient credits',
      'error_code', 'INSUFFICIENT_CREDITS',
      'required', p_amount,
      'available', v_credits_before,
      'plan', v_plan
    );
  END IF;

  -- Déduire crédits (transaction atomique)
  v_credits_after := v_credits_before - p_amount;

  UPDATE user_credits
  SET
    credits_remaining = v_credits_after,
    daily_usage = daily_usage + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log transaction (audit trail)
  INSERT INTO credit_transactions (
    user_id,
    amount,
    type,
    operation_details,
    credits_before,
    credits_after,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    -p_amount,
    p_type,
    p_details,
    v_credits_before,
    v_credits_after,
    p_ip::inet,
    p_user_agent
  );

  -- Retour succès
  RETURN jsonb_build_object(
    'success', true,
    'credits_before', v_credits_before,
    'credits_after', v_credits_after,
    'amount_deducted', p_amount,
    'daily_usage', v_daily_usage + p_amount,
    'daily_limit', v_daily_limit,
    'plan', v_plan
  );
END;
$$ LANGUAGE plpgsql;

-- 5. Fonction d'ajout de crédits (achats)
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT DEFAULT 'purchase',
  p_details JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB AS $$
DECLARE
  v_credits_before INTEGER;
  v_credits_after INTEGER;
BEGIN
  -- Lock user row
  SELECT credits_remaining
  INTO v_credits_before
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  v_credits_after := v_credits_before + p_amount;

  -- Ajouter crédits
  UPDATE user_credits
  SET
    credits_remaining = v_credits_after,
    credits_total = credits_total + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log transaction
  INSERT INTO credit_transactions (
    user_id, amount, type, operation_details,
    credits_before, credits_after
  ) VALUES (
    p_user_id, p_amount, p_type, p_details,
    v_credits_before, v_credits_after
  );

  RETURN jsonb_build_object(
    'success', true,
    'credits_before', v_credits_before,
    'credits_after', v_credits_after,
    'amount_added', p_amount
  );
END;
$$ LANGUAGE plpgsql;

-- 6. Fonction de détection de recherche dupliquée
CREATE OR REPLACE FUNCTION check_duplicate_search(
  p_user_id UUID,
  p_search_hash TEXT,
  p_search_params JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB AS $$
DECLARE
  v_last_search TIMESTAMP;
  v_count INTEGER;
  v_minutes_since INTEGER;
BEGIN
  SELECT last_search_at, search_count
  INTO v_last_search, v_count
  FROM search_fingerprints
  WHERE user_id = p_user_id AND search_hash = p_search_hash;

  IF FOUND THEN
    v_minutes_since := EXTRACT(EPOCH FROM (NOW() - v_last_search)) / 60;

    -- Si recherche identique < 10 minutes → BLOQUER
    IF v_minutes_since < 10 THEN
      RETURN jsonb_build_object(
        'is_duplicate', true,
        'should_block', true,
        'reason', 'Same search within 10 minutes',
        'last_search', v_last_search,
        'minutes_since', v_minutes_since,
        'wait_minutes', 10 - v_minutes_since
      );
    END IF;

    -- Update fingerprint
    UPDATE search_fingerprints
    SET
      last_search_at = NOW(),
      search_count = search_count + 1
    WHERE user_id = p_user_id AND search_hash = p_search_hash;

    RETURN jsonb_build_object(
      'is_duplicate', true,
      'should_block', false,
      'search_count', v_count + 1
    );
  ELSE
    -- Nouvelle recherche
    INSERT INTO search_fingerprints (user_id, search_hash, search_params)
    VALUES (p_user_id, p_search_hash, p_search_params)
    ON CONFLICT (user_id, search_hash) DO UPDATE
    SET
      last_search_at = NOW(),
      search_count = search_fingerprints.search_count + 1;

    RETURN jsonb_build_object(
      'is_duplicate', false,
      'should_block', false,
      'search_count', 1
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 7. Fonction pour obtenir les stats de crédits
CREATE OR REPLACE FUNCTION get_user_credit_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'credits_remaining', credits_remaining,
    'credits_total', credits_total,
    'plan', plan,
    'daily_usage', daily_usage,
    'daily_limit', CASE plan
      WHEN 'free' THEN 50
      WHEN 'starter' THEN 200
      WHEN 'pro' THEN 1000
      WHEN 'business' THEN 5000
      ELSE 999999
    END,
    'last_daily_reset', last_daily_reset,
    'subscription_status', subscription_status
  )
  INTO v_stats
  FROM user_credits
  WHERE user_id = p_user_id;

  RETURN COALESCE(v_stats, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- 8. Row Level Security
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_fingerprints ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Users can view own fingerprints" ON search_fingerprints;

-- Users can only view their own transactions
CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only view their own search fingerprints
CREATE POLICY "Users can view own fingerprints" ON search_fingerprints
  FOR SELECT USING (auth.uid() = user_id);

-- 9. Trigger pour auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_credits_updated_at ON user_credits;
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. Vues pour analytics (admin only)
CREATE OR REPLACE VIEW admin_credit_analytics AS
SELECT
  DATE(created_at) as date,
  type,
  COUNT(*) as transaction_count,
  SUM(ABS(amount)) as total_credits,
  AVG(ABS(amount)) as avg_credits_per_transaction
FROM credit_transactions
WHERE amount < 0 -- Déductions uniquement
GROUP BY DATE(created_at), type
ORDER BY date DESC, total_credits DESC;

CREATE OR REPLACE VIEW admin_user_spending AS
SELECT
  u.email,
  uc.plan,
  uc.credits_remaining,
  uc.credits_total,
  COUNT(ct.id) as total_transactions,
  SUM(CASE WHEN ct.amount < 0 THEN ABS(ct.amount) ELSE 0 END) as total_credits_spent,
  MAX(ct.created_at) as last_transaction_at
FROM auth.users u
JOIN user_credits uc ON u.id = uc.user_id
LEFT JOIN credit_transactions ct ON u.id = ct.user_id
GROUP BY u.id, u.email, uc.plan, uc.credits_remaining, uc.credits_total
ORDER BY total_credits_spent DESC;

-- ========================================
-- NOTES D'IMPLÉMENTATION
-- ========================================
--
-- COÛTS PAR OPÉRATION :
-- - Cache fresh (<7j) : 1 crédit
-- - Cache stale (7-30j) : 5 crédits
-- - Nouveau scraping : 50 crédits
-- - Grok enrichment : 10 crédits/établissement
-- - Export CSV : 2 crédits
-- - Export Sheets : 5 crédits
--
-- PLANS TARIFAIRES :
-- - Free: 500 crédits/mois (limite 50/jour)
-- - Starter: 2500 crédits/mois à 29€ (limite 200/jour)
-- - Pro: 10000 crédits/mois à 99€ (limite 1000/jour)
-- - Business: 50000 crédits/mois à 399€ (limite 5000/jour)
-- - Enterprise: Illimité à 1499€
--
-- MESURES ANTI-TRICHE :
-- ✅ Transactions atomiques (FOR UPDATE)
-- ✅ Audit trail complet (credit_transactions)
-- ✅ Limites journalières par plan
-- ✅ Détection recherches dupliquées (10min cooldown)
-- ✅ RLS sur toutes les tables sensibles
-- ✅ Validation serveur uniquement (jamais client)
