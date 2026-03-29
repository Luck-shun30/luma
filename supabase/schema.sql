create extension if not exists vector;

create table if not exists users (
  id uuid primary key,
  display_name text not null default 'Luma user',
  timezone text not null default 'America/Chicago',
  home_lat double precision,
  home_lng double precision,
  created_at timestamptz not null default now()
);

create table if not exists style_profiles (
  user_id uuid primary key references users (id) on delete cascade,
  freeform_preferences text not null default '',
  structured_traits_json jsonb not null default '{}'::jsonb,
  disliked_traits_json jsonb not null default '[]'::jsonb,
  style_embedding vector(768),
  updated_at timestamptz not null default now()
);

create table if not exists inspiration_assets (
  id uuid primary key,
  user_id uuid not null references users (id) on delete cascade,
  storage_path text not null,
  summary_json jsonb not null default '[]'::jsonb,
  embedding vector(768),
  created_at timestamptz not null default now()
);

create table if not exists wardrobe_items (
  id uuid primary key,
  user_id uuid not null references users (id) on delete cascade,
  status text not null check (status in ('processing', 'needs_review', 'active', 'archived')),
  name text not null,
  category text not null,
  subcategory text not null,
  colors_json jsonb not null default '[]'::jsonb,
  pattern text not null default 'solid',
  fabric text not null default 'unknown',
  size text not null default '',
  formality text not null default 'casual',
  seasonality_json jsonb not null default '[]'::jsonb,
  layer_role text not null default 'base',
  occasion_tags_json jsonb not null default '[]'::jsonb,
  style_tags_json jsonb not null default '[]'::jsonb,
  wear_count integer not null default 0,
  last_worn_at timestamptz,
  favorite_score integer not null default 0,
  dislike_score integer not null default 0,
  confidence_json jsonb not null default '{}'::jsonb,
  source_prompt_version text not null default 'unknown',
  created_at timestamptz not null default now()
);

create table if not exists wardrobe_assets (
  id uuid primary key,
  item_id uuid not null references wardrobe_items (id) on delete cascade,
  original_path text not null,
  cropped_path text not null,
  isolated_path text not null,
  mask_path text not null,
  bbox_json jsonb,
  quality_flags_json jsonb not null default '[]'::jsonb
);

create table if not exists processing_jobs (
  id uuid primary key,
  user_id uuid not null references users (id) on delete cascade,
  status text not null check (status in ('queued', 'processing', 'completed', 'failed')),
  capture_mode text not null default 'single-item',
  file_name text not null,
  mime_type text not null,
  source_path text not null,
  result_item_ids jsonb not null default '[]'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists outfit_suggestions (
  id uuid primary key,
  user_id uuid not null references users (id) on delete cascade,
  generated_for_date date not null,
  context_json jsonb not null default '{}'::jsonb,
  primary_slots_json jsonb not null default '{}'::jsonb,
  alternate_slots_json jsonb not null default '[]'::jsonb,
  reasoning_json jsonb not null default '[]'::jsonb,
  confidence double precision not null default 0,
  accepted_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists feedback_events (
  id uuid primary key,
  user_id uuid not null references users (id) on delete cascade,
  target_type text not null check (target_type in ('item', 'outfit')),
  target_id uuid not null,
  reaction text not null check (reaction in ('like', 'dislike', 'swap', 'accept', 'reject')),
  reason_code text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists weather_snapshots (
  id uuid primary key,
  user_id uuid not null references users (id) on delete cascade,
  forecast_date date not null,
  temperature_high_c double precision not null,
  temperature_low_c double precision not null,
  precipitation_probability double precision not null default 0,
  condition_code text not null,
  raw_json jsonb not null default '{}'::jsonb
);

create table if not exists stylist_threads (
  id uuid primary key,
  user_id uuid not null references users (id) on delete cascade,
  title text not null default 'Daily stylist',
  created_at timestamptz not null default now()
);

create table if not exists stylist_messages (
  id uuid primary key,
  thread_id uuid not null references stylist_threads (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  tool_calls_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists ai_runs (
  id uuid primary key,
  user_id uuid not null references users (id) on delete cascade,
  run_type text not null check (run_type in ('ingest', 'outfit', 'chat', 'embed')),
  model text not null,
  prompt_version text not null,
  input_json jsonb not null default '{}'::jsonb,
  output_json jsonb not null default '{}'::jsonb,
  latency_ms integer not null default 0,
  token_usage_json jsonb not null default '{}'::jsonb,
  status text not null check (status in ('succeeded', 'failed')),
  created_at timestamptz not null default now()
);

create table if not exists notification_events (
  id uuid primary key,
  user_id uuid not null references users (id) on delete cascade,
  title text not null,
  body text not null,
  level text not null default 'info',
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values ('wardrobe', 'wardrobe', true)
on conflict (id) do nothing;
