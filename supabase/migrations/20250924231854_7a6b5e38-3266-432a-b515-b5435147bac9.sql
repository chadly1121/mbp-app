-- Add beta access control to profiles table
ALTER TABLE public.profiles 
ADD COLUMN beta_access_status TEXT DEFAULT 'pending' CHECK (beta_access_status IN ('pending', 'approved', 'denied')),
ADD COLUMN beta_requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN beta_approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN beta_approved_by UUID REFERENCES auth.users(id);

-- Create admin role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add user role to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_role app_role DEFAULT 'user';

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = $1 AND user_role = 'admin'
  );
$$;

-- Create function to check beta access
CREATE OR REPLACE FUNCTION public.has_beta_access(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = $1 AND beta_access_status = 'approved'
  );
$$;

-- Update existing users to have approved beta access (for testing)
UPDATE public.profiles 
SET beta_access_status = 'approved', 
    beta_approved_at = now() 
WHERE beta_access_status = 'pending';