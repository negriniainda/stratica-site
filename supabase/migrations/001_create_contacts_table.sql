-- Criar tabela para armazenar contatos do formulário
CREATE TABLE contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de novos contatos (anônimo)
CREATE POLICY "Allow anonymous insert on contacts" ON contacts
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Política para permitir leitura apenas para usuários autenticados
CREATE POLICY "Allow authenticated read on contacts" ON contacts
    FOR SELECT
    TO authenticated
    USING (true);

-- Conceder permissões para o role anon (inserção)
GRANT INSERT ON contacts TO anon;

-- Conceder permissões para o role authenticated (leitura)
GRANT SELECT ON contacts TO authenticated;

-- Criar índice para melhor performance nas consultas por email
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);