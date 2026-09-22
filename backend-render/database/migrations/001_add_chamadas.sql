DO $$
BEGIN
  CREATE TYPE status_chamada AS ENUM ('aberta', 'encerrada');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS chamadas (
    id              SERIAL PRIMARY KEY,
    treino_id       INTEGER NOT NULL REFERENCES treinos(id) ON DELETE CASCADE,
    data            DATE NOT NULL,
    status          status_chamada NOT NULL DEFAULT 'aberta',
    professor_id    INTEGER NOT NULL REFERENCES professores(id) ON DELETE RESTRICT,
    aberta_em       TIMESTAMP NOT NULL DEFAULT NOW(),
    encerrada_em    TIMESTAMP,
    encerrada_por   INTEGER REFERENCES professores(id) ON DELETE SET NULL,
    UNIQUE(treino_id, data)
);

CREATE INDEX IF NOT EXISTS idx_chamadas_treino_data
  ON chamadas(treino_id, data);
