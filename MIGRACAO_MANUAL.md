# Migração Manual do Banco de Dados - Supabase Produção

## Problema Identificado
O formulário de contato está retornando erro 500 porque as tabelas não existem no banco de produção do Supabase.

## Solução: Aplicar Migrações Manualmente

### Passo 1: Acessar o Dashboard do Supabase
1. Acesse: https://supabase.com/dashboard/project/vhlhpmceibygaqajpoir
2. Vá para a seção "SQL Editor"

### Passo 2: Executar as Migrações na Ordem

#### Migração 1: Criar Tabela de Contatos
```sql
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
```

#### Migração 2: Criar Tabela de Assessments
```sql
-- Criar tabela para armazenar resultados dos assessments
CREATE TABLE assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    position TEXT,
    result_level INTEGER NOT NULL,
    result_title TEXT NOT NULL,
    total_score INTEGER NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
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
CREATE INDEX idx_assessments_created_at ON assessments(created_at DESC);
CREATE INDEX idx_assessments_result_level ON assessments(result_level);
```

### Passo 3: Verificar se as Tabelas Foram Criadas
Após executar as migrações, execute:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

### Passo 4: Testar o Formulário
Após aplicar as migrações, teste o formulário de contato no site:
https://trae815i0uev-negriniainda-marcelos-projects-bd4991f0.vercel.app

## Problema de Corrupção do Banco Local (RESOLVIDO)

### Diagnóstico
Em 18/08/2025, foram identificados erros críticos no banco PostgreSQL local:
- `could not locate required checkpoint record at 0/4000080`
- `invalid checkpoint record`
- `database system is shut down`
- `aborting startup due to startup process failure`

Estes erros indicavam corrupção severa do banco de dados local.

### Solução Aplicada
```bash
npx supabase db reset
```

O comando executou com sucesso:
- ✅ Download da imagem PostgreSQL 17.4.1.069
- ✅ Inicialização do schema
- ✅ Aplicação de todas as migrações (001-004)
- ✅ Execução do seed.sql
- ✅ Reinicialização dos containers

### Resultado
- ✅ Banco local funcionando corretamente
- ✅ Todas as tabelas criadas (contacts, assessments)
- ✅ Edge Functions rodando em http://localhost:9999
- ✅ Site local funcionando em http://localhost:8000
- ✅ Formulário de contato local operacional

## Status Atual
- ✅ Edge Functions deployadas com sucesso
- ✅ Ambiente local totalmente funcional
- ✅ Problema de corrupção do banco local resolvido
- ❌ Migrações do banco de produção precisam ser aplicadas manualmente
- ❌ Formulário de contato de produção com erro 500

## Análise dos Logs de Produção (18/08/2025)

### Logs de Autenticação (Auth)
Na análise dos logs de Auth de produção, foram identificados:
- ✅ Múltiplas tentativas de criação de schema de migrações
- ⚠️ Erros recorrentes: "problem creating schema migrations: couldn't start a new transaction: could not create new transaction: failed to connect to `host=localhost user=postgres`"
- ⚠️ Problemas de conexão com PostgreSQL local durante tentativas de migração
- ℹ️ Servidor prometheus funcionando normalmente na porta 9.9.9.0:9122

### Logs de Database
Na análise dos logs de Database de produção, foram identificados problemas críticos:
- 🔴 **FATAL**: "could not locate required checkpoint record at 0/4000080"
- 🔴 **FATAL**: "invalid checkpoint record"
- 🔴 **LOG**: "database system is shut down"
- 🔴 **LOG**: "aborting startup due to startup process failure"
- 🔴 **LOG**: "starting backup recovery with redo LSN 0/4000080, checkpoint LSN 0/4000080, on timeline ID 1"
- ⚠️ Múltiplas tentativas de recuperação de backup falharam
- ⚠️ Sistema de banco interrompido repetidamente

### Logs de Storage
Na análise dos logs de Storage de produção:
- ✅ Requisições HTTP normais sendo processadas
- ✅ Múltiplas requisições GET para `/storage/v1/object/info` com status 200
- ✅ Requisições para recursos estáticos (CSS, JS) funcionando
- ✅ Sem erros críticos identificados no storage

### Diagnóstico Final
**PROBLEMA CRÍTICO IDENTIFICADO**: O ambiente de **PRODUÇÃO** do Supabase está enfrentando os mesmos problemas de corrupção de banco de dados que foram resolvidos no ambiente local.

#### Problemas Identificados:
1. **Corrupção do PostgreSQL em Produção**: Os logs mostram exatamente os mesmos erros de checkpoint que foram identificados no ambiente local
2. **Falhas de Migração**: As tentativas de aplicar migrações estão falhando devido à corrupção do banco
3. **Sistema de Banco Inoperante**: O PostgreSQL de produção está constantemente sendo reiniciado devido aos erros de checkpoint

#### Impacto:
- ❌ Formulário de contato retorna erro 500
- ❌ Impossível aplicar migrações manuais enquanto o banco estiver corrompido
- ❌ Todas as operações de banco de dados estão falhando

### Solução Recomendada
**URGENTE**: O problema não é apenas de migrações não aplicadas, mas sim de **corrupção do banco de dados de produção**.

#### Ações Necessárias:
1. **Contatar Suporte do Supabase**: Reportar a corrupção do banco de produção
2. **Solicitar Reset do Banco de Produção**: Similar ao que foi feito localmente
3. **Backup de Dados**: Se houver dados importantes, solicitar backup antes do reset
4. **Reaplicar Migrações**: Após o reset, aplicar as migrações manualmente

#### Não é Possível:
- ❌ Aplicar migrações manuais no estado atual (banco corrompido)
- ❌ Resolver o problema apenas com SQL no dashboard
- ❌ Usar o ambiente de produção até que a corrupção seja resolvida

## Próximos Passos
1. **URGENTE**: Contatar suporte do Supabase sobre corrupção do banco de produção
2. Solicitar reset/restauração do banco de produção
3. Após resolução da corrupção, aplicar as migrações manualmente
4. Testar o formulário de contato de produção
5. Verificar se o assessment de produção também está funcionando