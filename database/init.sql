-- Rydo Database Initialization
-- This runs on first Docker startup

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('active', 'suspended', 'pending');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('passenger', 'rider', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ride_status AS ENUM ('scheduled', 'active', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Tables will be auto-created by TypeORM synchronize in development
-- Use migrations for production

-- Seed default admin user (password: Admin@123)
-- INSERT INTO users (id, name, email, password_hash, role, status, email_verified)
-- VALUES (
--   uuid_generate_v4(),
--   'Rydo Admin',
--   'admin@rydo.app',
--   crypt('Admin@123', gen_salt('bf')),
--   'admin',
--   'active',
--   true
-- ) ON CONFLICT DO NOTHING;
