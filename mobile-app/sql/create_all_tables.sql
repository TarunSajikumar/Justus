-- ================================================================
-- JustUs — Full Schema Migration
-- Run this in Supabase SQL Editor (safe to re-run: uses IF NOT EXISTS)
-- ================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── Users ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT,
  email               TEXT UNIQUE,
  phone               TEXT UNIQUE,
  partner_id          UUID,           -- legacy direct link (kept for compat)
  couple_id           UUID,           -- FK to couples table
  relationship_status TEXT NOT NULL DEFAULT 'solo', -- 'solo' | 'couple'
  dob                 DATE,
  gender              TEXT,
  push_token          TEXT,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ─── Couples ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS couples (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anniversary_date DATE,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- Add couple_id & relationship_status to existing users table if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='couple_id'
  ) THEN
    ALTER TABLE users ADD COLUMN couple_id UUID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='relationship_status'
  ) THEN
    ALTER TABLE users ADD COLUMN relationship_status TEXT NOT NULL DEFAULT 'solo';
  END IF;
END
$$;

-- ─── OTP Codes ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS otp_codes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact    TEXT NOT NULL UNIQUE,
  code       TEXT NOT NULL,
  verified   BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Invites ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code       TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES users(id) NOT NULL,
  used_by    UUID REFERENCES users(id),
  status     TEXT NOT NULL DEFAULT 'pending', -- pending | used | cancelled
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Messages ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id   UUID REFERENCES couples(id) NOT NULL,
  sender_id   UUID REFERENCES users(id) NOT NULL,
  message     TEXT NOT NULL,
  read        BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── Memories ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS memories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id  UUID REFERENCES couples(id) NOT NULL,
  image_url  TEXT NOT NULL,
  caption    TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Realtime ────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ─── Row Level Security ──────────────────────────────────────────
ALTER TABLE users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples     ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites     ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages    ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories    ENABLE ROW LEVEL SECURITY;

-- Permissive dev policies
CREATE POLICY "allow_all_users"     ON users     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_couples"   ON couples   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_otp"       ON otp_codes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_invites"   ON invites   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_messages"  ON messages  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_memories"  ON memories  FOR ALL USING (true) WITH CHECK (true);
