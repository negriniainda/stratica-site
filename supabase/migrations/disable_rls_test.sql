-- Temporarily disable RLS on assessments table for testing
ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;

-- Check if RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'assessments' AND schemaname = 'public';

-- Grant full access to anon role for testing
GRANT ALL PRIVILEGES ON assessments TO anon;
GRANT ALL PRIVILEGES ON assessments TO authenticated;

-- Check current permissions
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'assessments' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;