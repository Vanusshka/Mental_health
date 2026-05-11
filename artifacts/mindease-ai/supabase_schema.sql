-- ============================================================
-- MindEase AI — Supabase Schema v2
-- Run this in Supabase SQL Editor
-- ============================================================

create extension if not exists "pgcrypto";

-- ── patients ──────────────────────────────────────────────────
create table if not exists patients (
  id          uuid primary key default gen_random_uuid(),
  doctor_id   text not null,
  name        text not null,
  age         integer,
  condition   text,
  notes       text,
  created_at  timestamptz not null default now()
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
  patient_id           uuid references patients(id) on delete set null,
  doctor_id            text,
  session_number       integer,
  timestamp            timestamptz not null default now()
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
create index if not exists idx_checkins_user_id    on emotional_checkins(user_id);
create index if not exists idx_checkins_patient_id on emotional_checkins(patient_id);
create index if not exists idx_checkins_doctor_id  on emotional_checkins(doctor_id);
create index if not exists idx_checkins_timestamp  on emotional_checkins(timestamp desc);
create index if not exists idx_participants_workshop on workshop_participants(workshop_id);
create index if not exists idx_patients_doctor     on patients(doctor_id);

-- ── RLS ───────────────────────────────────────────────────────
alter table emotional_checkins    enable row level security;
alter table workshops             enable row level security;
alter table workshop_participants enable row level security;
alter table patients              enable row level security;

create policy "allow_all_checkins"     on emotional_checkins    for all using (true) with check (true);
create policy "allow_all_workshops"    on workshops             for all using (true) with check (true);
create policy "allow_all_participants" on workshop_participants for all using (true) with check (true);
create policy "allow_all_patients"     on patients              for all using (true) with check (true);

-- ── Auto-update checkin_count ─────────────────────────────────
create or replace function update_workshop_checkin_count()
returns trigger language plpgsql as $$
begin
  update workshops set checkin_count = (
    select count(*) from workshop_participants where workshop_id = NEW.workshop_id
  ) where id = NEW.workshop_id;
  return NEW;
end;
$$;

drop trigger if exists trg_update_checkin_count on workshop_participants;
create trigger trg_update_checkin_count
after insert on workshop_participants
for each row execute function update_workshop_checkin_count();

-- ── patient_sessions ─────────────────────────────────────────────
create table if not exists patient_sessions (
  id                uuid primary key default gen_random_uuid(),
  patient_id        uuid not null references patients(id) on delete cascade,
  doctor_id         text not null,
  session_number    integer not null,
  mood              text not null check (mood in ('happy','neutral','sad')),
  stress_score      integer not null default 5,
  wellness_score    integer not null default 60,
  emotional_summary text,
  ai_analysis       text,
  dominant_emotion  text,
  assessment_level  text not null default 'moderate' check (assessment_level in ('elevated','moderate','positive')),
  reflection        text,
  answers           jsonb,
  created_at        timestamptz not null default now()
);

create index if not exists idx_sessions_patient on patient_sessions(patient_id);
create index if not exists idx_sessions_doctor  on patient_sessions(doctor_id);

alter table patient_sessions enable row level security;
create policy "allow_all_sessions" on patient_sessions for all using (true) with check (true);
