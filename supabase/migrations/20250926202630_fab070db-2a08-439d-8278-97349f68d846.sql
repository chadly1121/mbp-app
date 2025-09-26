-- Create objective sharing link tables
CREATE TABLE IF NOT EXISTS objective_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID NOT NULL,
  role TEXT CHECK (role IN ('viewer','editor')),
  token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  revoked BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS objective_link_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES objective_links(id),
  email TEXT,
  accessed_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE objective_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE objective_link_access ENABLE ROW LEVEL SECURITY;

-- RLS policies for objective_links
CREATE POLICY "Users can manage objective links" ON objective_links
  FOR ALL USING (true);

-- RLS policies for objective_link_access  
CREATE POLICY "Users can view link access" ON objective_link_access
  FOR SELECT USING (true);
  
CREATE POLICY "Users can insert link access" ON objective_link_access
  FOR INSERT WITH CHECK (true);