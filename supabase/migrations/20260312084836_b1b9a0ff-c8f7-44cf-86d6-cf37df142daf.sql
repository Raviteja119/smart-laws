
-- Add sector and state columns to documents
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS sector text DEFAULT NULL;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS state text DEFAULT NULL;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS financial_year text DEFAULT NULL;

-- Create government_bills table for curated Indian legislation
CREATE TABLE public.government_bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  sector text NOT NULL,
  state text DEFAULT 'Central',
  financial_year text NOT NULL,
  introduced_date date,
  status text DEFAULT 'Introduced',
  bill_type text DEFAULT 'Central',
  ministry text,
  source_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS (public read, no write from client)
ALTER TABLE public.government_bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view government bills"
ON public.government_bills FOR SELECT
TO authenticated
USING (true);
