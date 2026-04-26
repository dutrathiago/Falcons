-- Rode este script no SQL Editor do seu painel Supabase para criar a tabela correta

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

-- Ativar Row Level Security se necessário, e criar políticas
ALTER TABLE public.jogadores_leilao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso público leitura" ON public.jogadores_leilao FOR SELECT USING (true);
CREATE POLICY "Acesso público inserção" ON public.jogadores_leilao FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público atualização" ON public.jogadores_leilao FOR UPDATE USING (true);
CREATE POLICY "Acesso público deleção" ON public.jogadores_leilao FOR DELETE USING (true);
