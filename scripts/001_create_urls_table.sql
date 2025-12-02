-- Create the urls table for storing shortened links
CREATE TABLE IF NOT EXISTS urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_url TEXT NOT NULL,
  short_code TEXT NOT NULL UNIQUE,
  expiry_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast lookups by short_code
CREATE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);

-- Enable RLS but allow public access (no auth required for this app)
ALTER TABLE urls ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read URLs (for redirects)
CREATE POLICY "Allow public read access" ON urls FOR SELECT USING (true);

-- Allow anyone to insert URLs
CREATE POLICY "Allow public insert access" ON urls FOR INSERT WITH CHECK (true);

-- Allow anyone to delete URLs
CREATE POLICY "Allow public delete access" ON urls FOR DELETE USING (true);
