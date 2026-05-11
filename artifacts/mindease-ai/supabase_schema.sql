-- ============================================================
-- MindEase AI — Supabase Schema
-- Run this in Supabase SQL Editor (once)
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ── emotional_checkins ────────────────────────────────────────
create table if not exists emotional_checkins (
  id                   uuid primary key default gen_random_uuid(),
  user_id              text,
  display_name         text,
  email                text,
  mood                 text not null check (mood in ('happy','neutral','sad')),
  stress_score         integer not null default 5,
  emotional_summary    text,
  dominant_emotion     text,
  dominant_score       numeric,
  assessment_level     text not null default 'moderate' check (assessment_level in ('elevated','moderate','positive')),
  emotional_balance    integer not null default 60,
  burnout_risk         integer not null default 40,
  sleep_wellness       integer not null default 60,
  emotional_resilience integer not null default 60,
  social_connectivity  integer not null default 60,
  wellness_score       integer not null default 60,
  reflection           text,
  answers              jsonb,
  workshop_id          uuid references workshops(id) on delete set null,
  timestamp            timestamptz not null default now()
);

-- ── workshops ─────────────────────────────────────────────────
create table if not exists workshops (
  id                uuid primary key default gen_random_uuid(),
  workshop_name     text not null,
  description       text,
  organization_id   text,
  organization_name text,
  date              date,
  created_at        timestamptz not null default now(),
  checkin_count     integer not null default 0
);

-- ── workshop_participants ─────────────────────────────────────
create table if not exists workshop_participants (
  id               uuid primary key default gen_random_uuid(),
  workshop_id      uuid not null references workshops(id) on delete cascade,
  participant_mood text not null check (participant_mood in ('happy','neutral','sad')),
  stress_score     integer not null default 5,
  timestamp        timestamptz not null default now()
);

-- ── Indexes ───────────────────────────────────────────────────
create index if not exists idx_checkins_user_id   on emotional_checkins(user_id);
create index if not exists idx_checkins_timestamp on emotional_checkins(timestamp desc);
create index if not exists idx_checkins_mood      on emotional_checkins(mood);
create index if not exists idx_participants_workshop on workshop_participants(workshop_id);
create index if not exists idx_workshops_org      on workshops(organization_id);

-- ── RLS (Row Level Security) — open for demo ──────────────────
alter table emotional_checkins    enable row level security;
alter table workshops             enable row level security;
alter table workshop_participants enable row level security;

-- Allow all operations for anon key (demo mode — tighten in production)
create policy "allow_all_checkins"    on emotional_checkins    for all using (true) with check (true);
create policy "allow_all_workshops"   on workshops             for all using (true) with check (true);
create policy "allow_all_participants" on workshop_participants for all using (true) with check (true);

-- ── Auto-update checkin_count on participant insert ───────────
create or replace function update_workshop_checkin_count()
returns trigger language plpgsql as $$
begin
  update workshops
  set checkin_count = (
    select count(*) from workshop_participants where workshop_id = NEW.workshop_id
  )
  where id = NEW.workshop_id;
  return NEW;
end;
$$;

create trigger trg_update_checkin_count
after insert on workshop_participants
for each row execute function update_workshop_checkin_count();
