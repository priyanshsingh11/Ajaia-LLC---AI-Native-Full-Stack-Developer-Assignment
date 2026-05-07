-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Users Table (Public)
-- This table will store user metadata and will be synced via triggers or manual upsert on login.
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Documents Table
create table if not exists public.documents (
  id uuid default uuid_generate_v4() primary key,
  title text not null default 'Untitled Document',
  content jsonb default '{}'::jsonb,
  owner_id uuid references public.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Document Shares Table
create table if not exists public.document_shares (
  id uuid default uuid_generate_v4() primary key,
  document_id uuid references public.documents(id) on delete cascade not null,
  shared_with_user_id uuid references auth.users(id) on delete cascade not null,
  shared_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(document_id, shared_with_user_id)
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.documents enable row level security;
alter table public.document_shares enable row level security;

-- RLS Policies

-- Users: Anyone can view profiles, but only the user can update their own profile.
create policy "Public profiles are viewable by everyone." on public.users
  for select using (true);

create policy "Users can update own profile." on public.users
  for update using (auth.uid() = id);

-- Documents: 
-- 1. Owners can do everything.
-- 2. Shared users can read and update.
create policy "Owners can view their own documents." on public.documents
  for select using (auth.uid() = owner_id);

create policy "Owners can insert their own documents." on public.documents
  for insert with check (auth.uid() = owner_id);

create policy "Owners can update their own documents." on public.documents
  for update using (auth.uid() = owner_id);

create policy "Owners can delete their own documents." on public.documents
  for delete using (auth.uid() = owner_id);

-- Shared access:
create policy "Shared users can view documents." on public.documents
  for select using (
    exists (
      select 1 from public.document_shares
      where document_id = public.documents.id
      and shared_with_user_id = auth.uid()
    )
  );

create policy "Shared users can update documents." on public.documents
  for update using (
    exists (
      select 1 from public.document_shares
      where document_id = public.documents.id
      and shared_with_user_id = auth.uid()
    )
  );

-- Document Shares:
-- 1. Owners can view, insert, and delete shares.
-- 2. Shared users can view shares for that document.

create policy "Owners can manage shares for their documents." on public.document_shares
  for all using (
    exists (
      select 1 from public.documents
      where id = public.document_shares.document_id
      and owner_id = auth.uid()
    )
  );

create policy "Shared users can view shares for their documents." on public.document_shares
  for select using (
    shared_with_user_id = auth.uid()
  );

-- Trigger for updated_at on documents
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_document_updated
  before update on public.documents
  for each row
  execute procedure public.handle_updated_at();

-- Trigger for syncing public.users on auth.users creation
-- This is a convenience for the demo.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
