-- Check permissions for assessments table
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'assessments' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Grant permissions if missing
GRANT SELECT, INSERT ON assessments TO anon;
GRANT ALL PRIVILEGES ON assessments TO authenticated;

-- Check permissions again
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'assessments' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;