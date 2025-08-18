-- Corrigir permissões para as tabelas contacts e assessments

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Allow anonymous insert on contacts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated read on contacts" ON contacts;
DROP POLICY IF EXISTS "Allow anonymous insert on assessments" ON assessments;
DROP POLICY IF EXISTS "Allow authenticated read on assessments" ON assessments;

-- Recriar políticas para contacts
CREATE POLICY "Enable insert for anon users" ON contacts
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Enable read for authenticated users" ON contacts
    FOR SELECT
    TO authenticated
    USING (true);

-- Recriar políticas para assessments
CREATE POLICY "Enable insert for anon users" ON assessments
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Enable read for authenticated users" ON assessments
    FOR SELECT
    TO authenticated
    USING (true);

-- Garantir permissões explícitas
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Permissões específicas para as tabelas
GRANT INSERT ON contacts TO anon;
GRANT SELECT ON contacts TO authenticated;
GRANT INSERT ON assessments TO anon;
GRANT SELECT ON assessments TO authenticated;