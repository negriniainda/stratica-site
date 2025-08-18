-- Desabilitar RLS temporariamente para testar as Edge Functions

-- Desabilitar RLS na tabela contacts
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;

-- Desabilitar RLS na tabela assessments
ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;

-- Garantir permissões completas para anon e authenticated
GRANT ALL PRIVILEGES ON contacts TO anon;
GRANT ALL PRIVILEGES ON contacts TO authenticated;
GRANT ALL PRIVILEGES ON assessments TO anon;
GRANT ALL PRIVILEGES ON assessments TO authenticated;

-- Garantir permissões na sequência
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;