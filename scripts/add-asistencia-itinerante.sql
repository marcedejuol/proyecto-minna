-- Agrega la opcion "Itinerante" al campo asistencia_edi de la tabla registros.
-- Valores: 0 = No asiste, 1 = Asiste, 2 = Itinerante (nuevo)
-- Pegar en el SQL Editor de Neon (base del proyecto minnaconsultoria).

-- PASO 1 (solo lectura): ver la restriccion actual sobre asistencia_edi
SELECT c.conname, pg_get_constraintdef(c.oid) AS definicion
FROM pg_constraint c
JOIN pg_class t ON t.oid = c.conrelid
WHERE t.relname = 'registros'
  AND c.contype = 'c'
  AND pg_get_constraintdef(c.oid) ILIKE '%asistencia_edi%';

-- PASO 2: reemplazar la restriccion para aceptar el valor 2
BEGIN;

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'registros'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) ILIKE '%asistencia_edi%'
  LOOP
    EXECUTE format('ALTER TABLE registros DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE registros
  ADD CONSTRAINT registros_asistencia_edi_check
  CHECK (asistencia_edi IN (0, 1, 2));

COMMIT;

-- PASO 3 (verificacion): debe mostrar CHECK ((asistencia_edi = ANY (ARRAY[0, 1, 2])))
SELECT c.conname, pg_get_constraintdef(c.oid) AS definicion
FROM pg_constraint c
JOIN pg_class t ON t.oid = c.conrelid
WHERE t.relname = 'registros'
  AND c.conname = 'registros_asistencia_edi_check';

-- ROLLBACK (solo si hiciera falta y no hay registros con valor 2):
-- ALTER TABLE registros DROP CONSTRAINT registros_asistencia_edi_check;
-- ALTER TABLE registros ADD CONSTRAINT registros_asistencia_edi_check CHECK (asistencia_edi IN (0, 1));
