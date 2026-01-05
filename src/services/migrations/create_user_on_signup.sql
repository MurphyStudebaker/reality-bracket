-- Migration: Auto-create user record on Supabase Auth signup
-- This trigger automatically creates a user record in the users table
-- when a new user signs up via Supabase Auth

-- First, ensure the users table exists and has the correct structure
-- (This should already be created from the schema, but included for reference)
-- CREATE TABLE IF NOT EXISTS users (
--   id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--   email TEXT UNIQUE NOT NULL,
--   username TEXT UNIQUE NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_username TEXT;
  default_username TEXT;
BEGIN
  -- Try to get username from user_metadata first (passed during signup)
  user_username := NEW.raw_user_meta_data->>'username';
  
  -- If no username in metadata, generate one from email
  IF user_username IS NULL OR user_username = '' THEN
    default_username := split_part(NEW.email, '@', 1);
    
    -- Ensure username is unique by appending a number if needed
    WHILE EXISTS (SELECT 1 FROM public.users WHERE username = default_username) LOOP
      default_username := default_username || floor(random() * 1000)::text;
    END LOOP;
    
    user_username := default_username;
  END IF;
  
  -- Ensure the username is unique
  WHILE EXISTS (SELECT 1 FROM public.users WHERE username = user_username) LOOP
    user_username := user_username || floor(random() * 1000)::text;
  END LOOP;
  
  -- Insert into users table
  INSERT INTO public.users (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    user_username
  )
  ON CONFLICT (id) DO UPDATE
    SET username = EXCLUDED.username
    WHERE users.username IS NULL OR users.username = ''; -- Only update if username is missing
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Note: If you want to pass the username during signup, you'll need to:
-- 1. Store it in user_metadata during signup: 
--    supabase.auth.signUp({ email, password, options: { data: { username } } })
-- 2. Update the function to read from NEW.raw_user_meta_data->>'username'

