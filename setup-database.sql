-- Plant Disease Detection Database Setup
-- Copy and paste this entire script into your Supabase SQL Editor

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

-- Enable RLS (Row Level Security)
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

-- Insert sample plant diseases data
insert into public.plant_diseases (name, plant_type, description, symptoms, treatment, prevention) values
('Early Blight', 'Tomato', 'A fungal disease caused by Alternaria solani that affects tomato plants.', 'Dark spots with concentric rings on leaves, yellowing and wilting of lower leaves.', 'Apply fungicides containing chlorothalonil or copper. Remove affected leaves and improve air circulation.', 'Rotate crops, avoid overhead watering, and maintain proper plant spacing.'),
('Late Blight', 'Tomato', 'A serious fungal disease caused by Phytophthora infestans.', 'Water-soaked spots on leaves that turn brown, white fuzzy growth on leaf undersides.', 'Apply fungicides with metalaxyl or mancozeb. Remove infected plants immediately.', 'Use resistant varieties, avoid overhead irrigation, and ensure good drainage.'),
('Leaf Mold', 'Tomato', 'A fungal disease caused by Passalora fulva, common in greenhouse conditions.', 'Yellow spots on upper leaf surface, olive-green to brown fuzzy growth on undersides.', 'Improve ventilation, reduce humidity, apply fungicides if necessary.', 'Maintain proper spacing, avoid overhead watering, and use resistant varieties.'),
('Septoria Leaf Spot', 'Tomato', 'A fungal disease caused by Septoria lycopersici.', 'Small circular spots with dark borders and light centers, yellowing leaves.', 'Apply fungicides containing chlorothalonil. Remove affected foliage.', 'Mulch around plants, avoid overhead watering, and rotate crops.'),
('Bacterial Spot', 'Tomato', 'A bacterial disease caused by Xanthomonas species.', 'Small dark spots on leaves and fruit, yellowing and defoliation.', 'Apply copper-based bactericides. Remove infected plants.', 'Use pathogen-free seeds, avoid overhead irrigation, and practice crop rotation.'),
('Target Spot', 'Tomato', 'A fungal disease caused by Corynespora cassiicola.', 'Circular spots with concentric rings, similar to early blight but smaller.', 'Apply fungicides and improve air circulation.', 'Avoid overhead watering and maintain proper plant spacing.'),
('Mosaic Virus', 'Tomato', 'A viral disease that affects tomato plants.', 'Mottled yellow and green patterns on leaves, stunted growth.', 'No cure available. Remove infected plants to prevent spread.', 'Control aphids, use virus-free seeds, and practice good sanitation.'),
('Yellow Leaf Curl Virus', 'Tomato', 'A viral disease transmitted by whiteflies.', 'Yellowing and curling of leaves, stunted plant growth.', 'No cure available. Control whitefly populations.', 'Use reflective mulches, control whiteflies, and use resistant varieties.'),
('Early Blight', 'Potato', 'A fungal disease caused by Alternaria solani affecting potato plants.', 'Dark lesions on leaves with concentric rings, yellowing of foliage.', 'Apply fungicides and remove affected foliage.', 'Rotate crops and avoid overhead watering.'),
('Late Blight', 'Potato', 'A devastating disease caused by Phytophthora infestans.', 'Water-soaked lesions on leaves, white growth on undersides, tuber rot.', 'Apply fungicides immediately and destroy infected plants.', 'Use certified seed potatoes and ensure good drainage.'),
('Bacterial Spot', 'Pepper', 'A bacterial disease affecting pepper plants.', 'Small raised spots on leaves and fruit, yellowing and defoliation.', 'Apply copper-based sprays and remove infected plants.', 'Use pathogen-free seeds and avoid overhead irrigation.');

