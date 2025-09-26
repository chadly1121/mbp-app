-- Create collaboration tables
create table if not exists objective_collab_members (
  id uuid primary key default gen_random_uuid(),
  objective_id uuid not null,
  email text not null,
  role text not null check (role in ('owner','editor','viewer')),
  joined_at timestamptz not null default now()
);

create table if not exists objective_comments (
  id uuid primary key default gen_random_uuid(),
  objective_id uuid not null,
  author_id uuid,
  author_email text,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists objective_activity (
  id uuid primary key default gen_random_uuid(),
  objective_id uuid not null,
  kind text not null check (kind in ('invite','comment','status')),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table objective_collab_members enable row level security;
alter table objective_comments enable row level security;
alter table objective_activity enable row level security;

-- Basic RLS policies for authenticated users
create policy "read all collab" on objective_collab_members for select to authenticated using (true);
create policy "write collab" on objective_collab_members for insert to authenticated with check (true);
create policy "delete collab" on objective_collab_members for delete to authenticated using (true);

create policy "read comments" on objective_comments for select to authenticated using (true);
create policy "write comments" on objective_comments for insert to authenticated with check (true);

create policy "read activity" on objective_activity for select to authenticated using (true);
create policy "write activity" on objective_activity for insert to authenticated with check (true);