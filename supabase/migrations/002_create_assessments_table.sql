-- Criar tabela para armazenar resultados do assessment de maturidade
CREATE TABLE assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT NOT NULL,
    position TEXT,
    total_score INTEGER NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    maturity_level INTEGER NOT NULL CHECK (maturity_level >= 1 AND maturity_level <= 5),
    level_title TEXT NOT NULL,
    level_description TEXT NOT NULL,
    answers JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de novos assessments (anônimo)
CREATE POLICY "Allow anonymous insert on assessments" ON assessments
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Política para permitir leitura apenas para usuários autenticados
CREATE POLICY "Allow authenticated read on assessments" ON assessments
    FOR SELECT
    TO authenticated
    USING (true);

-- Conceder permissões para o role anon (inserção)
GRANT INSERT ON assessments TO anon;

-- Conceder permissões para o role authenticated (leitura)
GRANT SELECT ON assessments TO authenticated;

-- Criar índices para melhor performance
CREATE INDEX idx_assessments_email ON assessments(email);
CREATE INDEX idx_assessments_company ON assessments(company);
CREATE INDEX idx_assessments_created_at ON assessments(created_at DESC);
CREATE INDEX idx_assessments_maturity_level ON assessments(maturity_level);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();