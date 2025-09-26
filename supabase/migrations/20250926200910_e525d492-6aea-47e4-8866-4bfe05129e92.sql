-- Create objective_invites table
CREATE TABLE IF NOT EXISTS public.objective_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('editor','viewer')),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '14 days',
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for token lookup
CREATE INDEX IF NOT EXISTS idx_objective_invites_token ON public.objective_invites(token);

-- Enable RLS
ALTER TABLE public.objective_invites ENABLE ROW LEVEL SECURITY;

-- RLS policies for authenticated users to manage invites
CREATE POLICY "read invites auth" ON public.objective_invites
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "insert invites auth" ON public.objective_invites
  FOR INSERT TO authenticated WITH CHECK (true);