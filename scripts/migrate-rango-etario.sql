-- Ampliar constraint de rango_etario de 3 a 6 valores
-- Ejecutar en Neon: Settings > SQL Editor

ALTER TABLE registros DROP CONSTRAINT registros_rango_etario_check;
ALTER TABLE registros ADD CONSTRAINT registros_rango_etario_check
  CHECK (rango_etario IN (1, 2, 3, 4, 5, 6));
