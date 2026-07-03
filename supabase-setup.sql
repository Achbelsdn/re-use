-- Exécuter ce SQL dans le Dashboard Supabase (SQL Editor)
-- pour créer la table des composants

CREATE TABLE IF NOT EXISTS components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price_label TEXT NOT NULL DEFAULT 'Gratuit',
  price_value INTEGER NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'Template',
  tag TEXT NOT NULL DEFAULT 'Gratuit',
  image_url TEXT NOT NULL DEFAULT '',
  filename TEXT NOT NULL DEFAULT '',
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Autoriser la lecture publique (les visiteurs doivent voir les composants)
ALTER TABLE components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON components
  FOR SELECT
  USING (true);

-- Seul le service_role (ton admin) peut INSERT / UPDATE / DELETE
CREATE POLICY "Allow admin write" ON components
  FOR ALL
  USING (auth.role() = 'service_role');
