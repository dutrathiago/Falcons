CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.jogadores_leilao
    ADD COLUMN IF NOT EXISTS ano INTEGER,
    ADD COLUMN IF NOT EXISTS peso NUMERIC,
    ADD COLUMN IF NOT EXISTS altura NUMERIC;

ALTER TABLE public.jogos
    ADD COLUMN IF NOT EXISTS data_fim DATE,
    ADD COLUMN IF NOT EXISTS titulo TEXT,
    ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'AMISTOSO',
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'AGENDADO';

CREATE TABLE IF NOT EXISTS public.estatisticas_individuais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    evento_id UUID NOT NULL REFERENCES public.jogos(id) ON DELETE CASCADE,
    jogador_id UUID NOT NULL REFERENCES public.jogadores_leilao(id) ON DELETE CASCADE,
    passe_a INTEGER DEFAULT 0,
    passe_b INTEGER DEFAULT 0,
    passe_c INTEGER DEFAULT 0,
    toque_bom INTEGER DEFAULT 0,
    toque_medio INTEGER DEFAULT 0,
    toque_ruim INTEGER DEFAULT 0,
    saque_ace INTEGER DEFAULT 0,
    saque_bom INTEGER DEFAULT 0,
    saque_erro INTEGER DEFAULT 0,
    ataque_ponto INTEGER DEFAULT 0,
    ataque_medio INTEGER DEFAULT 0,
    ataque_erro INTEGER DEFAULT 0,
    bloqueio_ponto INTEGER DEFAULT 0,
    bloqueio_medio INTEGER DEFAULT 0,
    bloqueio_erro INTEGER DEFAULT 0,
    nocao_boa INTEGER DEFAULT 0,
    nocao_media INTEGER DEFAULT 0,
    nocao_ruim INTEGER DEFAULT 0,
    pulo_bom INTEGER DEFAULT 0,
    pulo_medio INTEGER DEFAULT 0,
    pulo_ruim INTEGER DEFAULT 0,
    observacoes TEXT,
    CONSTRAINT estatisticas_individuais_evento_jogador_key UNIQUE (evento_id, jogador_id)
);

ALTER TABLE public.estatisticas_individuais ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'estatisticas_individuais'
          AND policyname = 'Acesso publico leitura estatisticas'
    ) THEN
        CREATE POLICY "Acesso publico leitura estatisticas"
        ON public.estatisticas_individuais FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'estatisticas_individuais'
          AND policyname = 'Acesso publico insercao estatisticas'
    ) THEN
        CREATE POLICY "Acesso publico insercao estatisticas"
        ON public.estatisticas_individuais FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'estatisticas_individuais'
          AND policyname = 'Acesso publico atualizacao estatisticas'
    ) THEN
        CREATE POLICY "Acesso publico atualizacao estatisticas"
        ON public.estatisticas_individuais FOR UPDATE USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'estatisticas_individuais'
          AND policyname = 'Acesso publico delecao estatisticas'
    ) THEN
        CREATE POLICY "Acesso publico delecao estatisticas"
        ON public.estatisticas_individuais FOR DELETE USING (true);
    END IF;
END $$;
