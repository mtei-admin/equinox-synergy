-- Equinox Synergy: development seed users
-- Run automatically on `supabase db reset`, or apply manually after migrations.
--
-- Sample credentials (development only):
--   Dealer: dealer@equinox.local / Dealer123!
--   Admin:  admin@equinox.local  / Admin123!

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Dealer account
-- ---------------------------------------------------------------------------

INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin
)
VALUES (
  '11111111-1111-1111-1111-111111111101',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'dealer@equinox.local',
  crypt('Dealer123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES (
  '11111111-1111-1111-1111-111111111201',
  '11111111-1111-1111-1111-111111111101',
  '11111111-1111-1111-1111-111111111101',
  jsonb_build_object(
    'sub', '11111111-1111-1111-1111-111111111101',
    'email', 'dealer@equinox.local',
    'email_verified', true
  ),
  'email',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- Employee (admin) account
-- ---------------------------------------------------------------------------

INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin
)
VALUES (
  '11111111-1111-1111-1111-111111111102',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin@equinox.local',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES (
  '11111111-1111-1111-1111-111111111202',
  '11111111-1111-1111-1111-111111111102',
  '11111111-1111-1111-1111-111111111102',
  jsonb_build_object(
    'sub', '11111111-1111-1111-1111-111111111102',
    'email', 'admin@equinox.local',
    'email_verified', true
  ),
  'email',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Profiles are auto-created by handle_new_user; enrich with roles and details.

UPDATE public.profiles
SET
  role = 'dealer',
  company_name = 'Acme Outdoors',
  contact_name = 'Demo Dealer',
  contact_email = 'dealer@equinox.local',
  is_active = TRUE
WHERE id = '11111111-1111-1111-1111-111111111101';

UPDATE public.profiles
SET
  role = 'employee',
  company_name = 'Equinox Synergy',
  contact_name = 'Demo Admin',
  contact_email = 'admin@equinox.local',
  is_active = TRUE
WHERE id = '11111111-1111-1111-1111-111111111102';

-- ---------------------------------------------------------------------------
-- Sample product catalog
-- ---------------------------------------------------------------------------

INSERT INTO public.products (
  sku,
  name,
  description,
  supplier_cost,
  dealer_price,
  stock_quantity
)
VALUES
  (
    'EQX-1001',
    'Trail Cam Pro 4K',
    'Weatherproof trail camera with 4K video and 120-day battery life.',
    89.00,
    149.99,
    45
  ),
  (
    'EQX-1002',
    'Summit Binocular 10x42',
    'Lightweight roof-prism binoculars for field scouting.',
    62.00,
    109.99,
    28
  ),
  (
    'EQX-1003',
    'Ridge Backpack 45L',
    'Modular hunting pack with hydration sleeve and rifle carry.',
    74.50,
    129.99,
    0
  ),
  (
    'EQX-1004',
    'NightScope IR Illuminator',
    'Long-range IR illuminator compatible with Equinox optics.',
    41.25,
    79.99,
    8
  ),
  (
    'EQX-1005',
    'Base Camp Field Kit',
    'Starter kit with cleaning tools, straps, and maintenance oils.',
    18.00,
    34.99,
    120
  ),
  (
    'EQX-1006',
    'Pro Tripod Carbon',
    'Carbon fiber tripod rated for spotting scopes up to 12 lbs.',
    95.00,
    169.99,
    15
  )
ON CONFLICT (sku) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Sample announcements
-- ---------------------------------------------------------------------------

INSERT INTO public.announcements (
  title,
  body,
  author_id,
  is_published,
  published_at
)
VALUES
  (
    'Welcome to Equinox Synergy',
    'Your dealer portal is live. Browse inventory, submit purchase orders, and download published manuals from the Asset Library.',
    '11111111-1111-1111-1111-111111111102',
    TRUE,
    NOW()
  ),
  (
    'Spring product lineup available',
    'New trail optics and field kits are in stock. Review wholesale pricing in the Inventory catalog and place orders before month end.',
    '11111111-1111-1111-1111-111111111102',
    TRUE,
    NOW()
  );
