-- Enable Row Level Security (RLS) for assessments table
-- This migration resolves the security warnings shown in Supabase dashboard

-- Enable RLS on the assessments table
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (for assessment results display)
CREATE POLICY "Allow public read access" ON public.assessments
    FOR SELECT
    USING (true);

-- Create policy to allow public insert access (for new assessments)
CREATE POLICY "Allow public insert access" ON public.assessments
    FOR INSERT
    WITH CHECK (true);

-- Grant necessary permissions to anon and authenticated roles
GRANT SELECT, INSERT ON public.assessments TO anon;
GRANT SELECT, INSERT ON public.assessments TO authenticated;

-- Add comment explaining the RLS setup
COMMENT ON TABLE public.assessments IS 'Assessment results table with RLS enabled. Allows public read/insert for assessment functionality.';