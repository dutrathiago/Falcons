-- Rode este script no SQL Editor do Supabase
-- Estrutura base para gestao da atletica de volei Falcons

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.jogadores_leilao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    leilao_id UUID,
    nome TEXT NOT NULL,
    apelido TEXT,
    posicao TEXT,
    camisa INTEGER,
    data_nascimento DATE,
    cpf TEXT,
    telefone TEXT,
    curso TEXT,
    ano INTEGER,
    peso NUMERIC,
    altura NUMERIC,
    pe TEXT,
    status TEXT DEFAULT 'DISPONIVEL',
    time_comprador TEXT,
    valor_arrematado NUMERIC,
    observacoes TEXT,
    foto_url TEXT,
    atq INTEGER DEFAULT 50,
    def INTEGER DEFAULT 50,
    fin INTEGER DEFAULT 50,
    ctl INTEGER DEFAULT 50,
    rit INTEGER DEFAULT 50,
    pas INTEGER DEFAULT 50,
    dri INTEGER DEFAULT 50,
    fis INTEGER DEFAULT 50
);

ALTER TABLE public.jogadores_leilao
    ADD COLUMN IF NOT EXISTS ano INTEGER,
    ADD COLUMN IF NOT EXISTS peso NUMERIC,
    ADD COLUMN IF NOT EXISTS altura NUMERIC;

ALTER TABLE public.jogadores_leilao ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'jogadores_leilao'
          AND policyname = 'Acesso publico leitura jogadores'
    ) THEN
        CREATE POLICY "Acesso publico leitura jogadores"
        ON public.jogadores_leilao FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'jogadores_leilao'
          AND policyname = 'Acesso publico insercao jogadores'
    ) THEN
        CREATE POLICY "Acesso publico insercao jogadores"
        ON public.jogadores_leilao FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'jogadores_leilao'
          AND policyname = 'Acesso publico atualizacao jogadores'
    ) THEN
        CREATE POLICY "Acesso publico atualizacao jogadores"
        ON public.jogadores_leilao FOR UPDATE USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'jogadores_leilao'
          AND policyname = 'Acesso publico delecao jogadores'
    ) THEN
        CREATE POLICY "Acesso publico delecao jogadores"
        ON public.jogadores_leilao FOR DELETE USING (true);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.jogos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data DATE NOT NULL,
    data_fim DATE,
    titulo TEXT,
    tipo TEXT DEFAULT 'AMISTOSO',
    status TEXT DEFAULT 'AGENDADO',
    adversario TEXT,
    local TEXT,
    placar_nos INTEGER,
    placar_eles INTEGER,
    observacoes TEXT
);

ALTER TABLE public.jogos
    ADD COLUMN IF NOT EXISTS data_fim DATE,
    ADD COLUMN IF NOT EXISTS titulo TEXT,
    ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'AMISTOSO',
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'AGENDADO';

ALTER TABLE public.jogos ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'jogos'
          AND policyname = 'Acesso publico leitura jogos'
    ) THEN
        CREATE POLICY "Acesso publico leitura jogos"
        ON public.jogos FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'jogos'
          AND policyname = 'Acesso publico insercao jogos'
    ) THEN
        CREATE POLICY "Acesso publico insercao jogos"
        ON public.jogos FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'jogos'
          AND policyname = 'Acesso publico atualizacao jogos'
    ) THEN
        CREATE POLICY "Acesso publico atualizacao jogos"
        ON public.jogos FOR UPDATE USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'jogos'
          AND policyname = 'Acesso publico delecao jogos'
    ) THEN
        CREATE POLICY "Acesso publico delecao jogos"
        ON public.jogos FOR DELETE USING (true);
    END IF;
END $$;

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
