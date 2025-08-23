-- Fix maturity_level constraint to allow values from 1 to 6
-- This fixes the 500 error when assessment results in level 6 (Classe Mundial)

-- Drop the existing constraint
ALTER TABLE assessments DROP CONSTRAINT IF EXISTS assessments_maturity_level_check;

-- Add new constraint allowing values from 1 to 6
ALTER TABLE assessments ADD CONSTRAINT assessments_maturity_level_check 
  CHECK (maturity_level >= 1 AND maturity_level <= 6);

-- Add comment explaining the levels
COMMENT ON COLUMN assessments.maturity_level IS 'Maturity level from 1 to 6: 1=Inicial, 2=Básico, 3=Intermediário, 4=Avançado, 5=Otimizado, 6=Classe Mundial';