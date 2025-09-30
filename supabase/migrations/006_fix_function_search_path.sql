-- Corrigir o search_path da função update_updated_at_column para resolver warning de segurança
-- Esta migração remove os triggers dependentes, recria a função com search_path seguro e recria os triggers

-- Primeiro, remover os triggers que dependem da função
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
DROP TRIGGER IF EXISTS update_assessments_updated_at ON assessments;

-- Agora remover a função existente
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Recriar a função com search_path seguro
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Comentário explicativo
COMMENT ON FUNCTION update_updated_at_column() IS 'Função para atualizar automaticamente o campo updated_at. Configurada com search_path = public para segurança.';

-- Recriar os triggers
CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at 
    BEFORE UPDATE ON assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();