-- Create users profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create plant diseases table
create table if not exists public.plant_diseases (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plant_type text not null,
  description text,
  symptoms text,
  treatment text,
  prevention text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create predictions table
create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text not null,
  plant_type text not null,
  predicted_disease text not null,
  confidence_score decimal(5,4) not null,
  status text default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.plant_diseases enable row level security;
alter table public.predictions enable row level security;

-- RLS policies for profiles
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- RLS policies for plant_diseases (public read access)
create policy "plant_diseases_select_all" on public.plant_diseases for select using (true);

-- RLS policies for predictions
create policy "predictions_select_own" on public.predictions for select using (auth.uid() = user_id);
create policy "predictions_insert_own" on public.predictions for insert with check (auth.uid() = user_id);
create policy "predictions_update_own" on public.predictions for update using (auth.uid() = user_id);
create policy "predictions_delete_own" on public.predictions for delete using (auth.uid() = user_id);
