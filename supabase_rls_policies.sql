-- ==============================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES FOR RE-USE MARKETPLACE
-- ==============================================================================
-- Instruction : Copie-colle ce script dans l'éditeur SQL de Supabase (SQL Editor) 
-- et exécute-le pour sécuriser ta base de données.

-- 0. Ajouter la colonne is_hidden (si elle n'existe pas encore)
-- Cela permet de masquer des composants dans le dashboard admin.
ALTER TABLE components ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

-- 1. Activer le Row Level Security (RLS) sur la table components
ALTER TABLE components ENABLE ROW LEVEL SECURITY;

-- 2. Politique : Lecture Publique
-- Tout le monde peut lire les composants qui ne sont pas masqués
CREATE POLICY "Public components are viewable by everyone." 
ON components FOR SELECT 
USING (is_hidden = false);

-- 3. Sécurité d'écriture
-- On NE crée PAS de politique pour INSERT, UPDATE ou DELETE en accès public (anon).
-- Les ajouts/modifications/suppressions se font via le backend Next.js qui 
-- utilise la clé `supabaseAdmin` (Service Role Key). Cette clé contourne 
-- automatiquement le RLS, ce qui empêche les utilisateurs normaux de 
-- manipuler les données depuis le client web, tout en autorisant le serveur.

-- FIN DU SCRIPT
