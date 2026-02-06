CREATE TABLE IF NOT EXISTS registros (
  id_registro SERIAL PRIMARY KEY,
  -- Identificacion del Registro
  departamento TEXT NOT NULL,
  distrito TEXT NOT NULL,
  nombre_edi TEXT NOT NULL,
  tipo_grupo INTEGER NOT NULL CHECK (tipo_grupo IN (1, 2)),
  fecha_recoleccion DATE NOT NULL,
  evaluador_id TEXT NOT NULL,
  -- Datos del Nino/a
  id_nino TEXT NOT NULL,
  sexo INTEGER NOT NULL CHECK (sexo IN (1, 2)),
  fecha_nacimiento DATE NOT NULL,
  edad_meses INTEGER NOT NULL CHECK (edad_meses >= 0),
  rango_etario INTEGER NOT NULL CHECK (rango_etario IN (1, 2, 3)),
  asistencia_edi INTEGER NOT NULL CHECK (asistencia_edi IN (0, 1)),
  -- Datos del Cuidador/a
  id_cuidador TEXT NOT NULL,
  parentesco INTEGER NOT NULL CHECK (parentesco IN (1, 2, 3)),
  edad_cuidador INTEGER NOT NULL CHECK (edad_cuidador >= 0),
  nivel_educativo INTEGER NOT NULL CHECK (nivel_educativo IN (1, 2, 3, 4)),
  acepta_consentimiento INTEGER NOT NULL CHECK (acepta_consentimiento = 1),
  -- Variables EAD-3
  ead_motor NUMERIC NOT NULL CHECK (ead_motor >= 0),
  ead_lenguaje NUMERIC NOT NULL CHECK (ead_lenguaje >= 0),
  ead_cognitivo NUMERIC NOT NULL CHECK (ead_cognitivo >= 0),
  ead_socioemocional NUMERIC NOT NULL CHECK (ead_socioemocional >= 0),
  ead_total NUMERIC NOT NULL CHECK (ead_total >= 0),
  -- Variables ECPP-p
  ecpp_vinculo NUMERIC NOT NULL CHECK (ecpp_vinculo >= 0),
  ecpp_estimulo NUMERIC NOT NULL CHECK (ecpp_estimulo >= 0),
  ecpp_cuidados NUMERIC NOT NULL CHECK (ecpp_cuidados >= 0),
  ecpp_total NUMERIC NOT NULL CHECK (ecpp_total >= 0),
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);
