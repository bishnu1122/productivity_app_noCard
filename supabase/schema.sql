-- Tasks Table
create table if not exists public.tasks (
  id bigint primary key generated always as identity,
  user_name text not null,
  description text not null,
  completed boolean default false,
  duration integer not null default 30,
  due_date timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Pomodoro Sessions Table
create table if not exists public.pomodoro_sessions (
  id bigint primary key generated always as identity,
  user_name text not null,
  task_id bigint references public.tasks(id),
  task_description text,
  duration integer not null,
  completed_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Notes Table
create table if not exists public.notes (
  id bigint primary key generated always as identity,
  user_name text not null,
  content text not null,
  type text check (type in ('morning', 'evening')),
  date date not null default current_date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Daily Habits Table
create table if not exists public.daily_habits (
  id bigint primary key generated always as identity,
  user_name text not null,
  wake_up_time time,
  exercise_completed boolean default false,
  meditation_minutes integer default 0,
  date date not null default current_date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.tasks enable row level security;
alter table public.pomodoro_sessions enable row level security;
alter table public.notes enable row level security;
alter table public.daily_habits enable row level security;

-- Tasks policies
create policy "Enable read access for all users"
  on public.tasks for select
  using (true);

create policy "Enable insert access for all users"
  on public.tasks for insert
  with check (true);

create policy "Enable update access for users based on user_name"
  on public.tasks for update
  using (true);

create policy "Enable delete access for users based on user_name"
  on public.tasks for delete
  using (true);

-- Pomodoro sessions policies
create policy "Enable read access for all users"
  on public.pomodoro_sessions for select
  using (true);

create policy "Enable insert access for all users"
  on public.pomodoro_sessions for insert
  with check (true);

-- Notes policies
create policy "Enable read access for all users"
  on public.notes for select
  using (true);

create policy "Enable insert access for all users"
  on public.notes for insert
  with check (true);

create policy "Enable update access for users based on user_name"
  on public.notes for update
  using (true);

-- Daily Habits policies
create policy "Enable read access for all users"
  on public.daily_habits for select
  using (true);

create policy "Enable insert access for all users"
  on public.daily_habits for insert
  with check (true);

create policy "Enable update access for users based on user_name"
  on public.daily_habits for update
  using (true);