create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'CasaQuest',
  created_at timestamptz not null default now()
);

create table if not exists household_members (
  household_id uuid references households(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  emoji text not null default '🙂',
  points integer not null default 0,
  xp integer not null default 0,
  level integer not null default 1,
  primary key (household_id, user_id)
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  name text not null,
  icon text not null default '✨',
  points integer not null default 1,
  category text not null default 'Casa',
  recurring text,
  active boolean not null default true
);

create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  name text not null,
  icon text not null default '🎁',
  cost integer not null default 5,
  type text not null default 'personal' check (type in ('personal','common')),
  active boolean not null default true
);

create table if not exists activity (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  task_id uuid references tasks(id) on delete set null,
  description text not null,
  points integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists household_wallet (
  household_id uuid primary key references households(id) on delete cascade,
  points integer not null default 0,
  weekly_goal integer not null default 100
);

alter table households enable row level security;
alter table household_members enable row level security;
alter table tasks enable row level security;
alter table rewards enable row level security;
alter table activity enable row level security;
alter table household_wallet enable row level security;

-- MVP policy: once a user belongs to a household, members can read household data.
create policy "members can read household" on households for select using (
  exists (select 1 from household_members m where m.household_id = households.id and m.user_id = auth.uid())
);
create policy "members can read members" on household_members for select using (
  user_id = auth.uid() or exists (select 1 from household_members m where m.household_id = household_members.household_id and m.user_id = auth.uid())
);
create policy "members can read tasks" on tasks for select using (
  exists (select 1 from household_members m where m.household_id = tasks.household_id and m.user_id = auth.uid())
);
create policy "members can read rewards" on rewards for select using (
  exists (select 1 from household_members m where m.household_id = rewards.household_id and m.user_id = auth.uid())
);
create policy "members can read activity" on activity for select using (
  exists (select 1 from household_members m where m.household_id = activity.household_id and m.user_id = auth.uid())
);
create policy "members can read wallet" on household_wallet for select using (
  exists (select 1 from household_members m where m.household_id = household_wallet.household_id and m.user_id = auth.uid())
);

-- For writes, use a server-side RPC/Edge Function in production so point changes are atomic.
