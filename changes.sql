-- ==========================================
-- Table: donations
-- ==========================================

CREATE TABLE public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_name VARCHAR(255),
    donor_email VARCHAR(255),
    donor_phone VARCHAR(50),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'KES',
    status VARCHAR(50) DEFAULT 'pending', -- e.g., pending, completed, failed
    payment_method VARCHAR(100), -- e.g., M-Pesa, Card, Bank Transfer
    payment_reference VARCHAR(255) UNIQUE, -- transaction ID from payment gateway
    campaign_id UUID, -- Optional: if donation is for a specific campaign
    is_anonymous BOOLEAN DEFAULT FALSE,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage donations"
    ON public.donations
    FOR ALL
    USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- Anyone can insert a donation (since donations usually come from public forms)
CREATE POLICY "Anyone can insert donations"
    ON public.donations
    FOR INSERT
    WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER handle_donations_updated_at
    BEFORE UPDATE ON public.donations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- Add Flagging, Hiding, and Ownership columns to CMS tables
-- ==========================================

DO $$ 
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['faqs', 'projects', 'events', 'gallery', 'products', 'contacts', 'social_media', 'posts'])
    LOOP
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS created_by_email TEXT;', tbl);
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS flagged BOOLEAN DEFAULT FALSE;', tbl);
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS flagged_by_email TEXT;', tbl);
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT FALSE;', tbl);
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS hidden_by_email TEXT;', tbl);
    END LOOP;
END $$;
