# Estrutura do Projeto - Falcons

## 📁 Organização Backend e Frontend

O projeto agora está separado em módulos bem definidos para melhor manutenibilidade:

### 🎨 Frontend (`src/frontend/`)

Contém toda a interface e lógica do lado do cliente:

```
frontend/
├── app/              # Pages e rotas Next.js (Server/Client components)
│   ├── layout.tsx    # Layout raiz
│   ├── page.tsx      # Página inicial
│   ├── globals.css   # Estilos globais
│   └── [features]/   # Páginas de features (dashboard, players, etc)
├── components/       # Componentes React reutilizáveis
├── hooks/           # Custom hooks (ex: useAuth, useData)
├── types/           # Tipos TypeScript compartilhados do frontend
└── styles/          # Variáveis e configs Tailwind (futura)
```

### 🔧 Backend (`src/backend/`)

Contém lógica de servidor e integração com banco de dados:

```
backend/
├── api/              # API routes do Next.js (/api/*)
├── services/         # Lógica de negócio e regras (ex: PlayerService, GameService)
├── db/              # Queries e operações com banco de dados
└── lib/             # Utilitários do servidor (Supabase client, middleware, etc)
```

### 📦 Shared (`src/shared/`)

Código compartilhado entre frontend e backend:

```
shared/
├── lib/             # Utilitários compartilhados
│   └── utils.ts     # Funções utilitárias gerais
└── types/           # Tipos compartilhados entre frontend e backend
```

---

## 📝 Convenções de Import

### No Frontend

```typescript
// ✅ Componentes e hooks do frontend
import Sidebar from "@/frontend/components/Sidebar";
import { usePlayers } from "@/frontend/hooks/usePlayers";

// ✅ Código compartilhado
import { cn } from "@/shared/lib/utils";
import type { Player } from "@/shared/types";

// ❌ Não importar de backend
import { playerService } from "@/backend/services"; // ❌ Evitar
```

### No Backend (API Routes)

```typescript
// ✅ Serviços e banco de dados do backend
import { playerService } from "@/backend/services/playerService";
import { supabaseServer } from "@/backend/lib/server";

// ✅ Código compartilhado
import { cn } from "@/shared/lib/utils";
import type { Player } from "@/shared/types";

// ❌ Não usar componentes React
import Sidebar from "@/frontend/components/Sidebar"; // ❌ Evitar
```

---

## 🚀 Próximos Passos

1. **Criar Serviços**: Mover lógica de negócio para `backend/services/`
2. **Organizar Queries**: Centralizar queries de BD em `backend/db/`
3. **Custom Hooks**: Criar hooks em `frontend/hooks/` para data fetching
4. **Types**: Consolidar tipos em `shared/types/`
5. **API Routes**: Estruturar rotas em `backend/api/`

---

## 📚 Exemplo de Fluxo

### Adicionando uma Nova Feature

1. **Página Frontend** → `src/frontend/app/my-feature/page.tsx`
2. **Componentes** → `src/frontend/components/MyFeatureCard.tsx`
3. **Custom Hook** → `src/frontend/hooks/useMyFeature.ts`
4. **Serviço Backend** → `src/backend/services/myFeatureService.ts`
5. **API Route** → `src/backend/api/my-feature/route.ts`
6. **Tipos Compartilhados** → `src/shared/types/myFeature.ts`
