# SERCAMP - Diretrizes do Projeto

## Stack Tecnológica

### Frontend
- **Framework:** SvelteKit com Svelte 5 (modo runes)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS + CSS Variables para temas
- **Animações:** GSAP (lazy loaded)
- **Build Tool:** Vite
- **Runtime:** Bun

### Backend
- **Framework:** Express.js
- **Linguagem:** TypeScript
- **ORM:** Prisma
- **Banco de Dados:** PostgreSQL
- **Runtime:** Bun
- **Autenticação:** JWT

## Svelte 5 - Regras Críticas

### ⚠️ NUNCA usar `onMount` - usar `$effect`

O `onMount` do Svelte **NÃO FUNCIONA** corretamente no modo runes do Svelte 5. Sempre usar `$effect`:

```svelte
<!-- ❌ ERRADO - NÃO FUNCIONA -->
<script lang="ts">
  import { onMount } from 'svelte';
  
  onMount(() => {
    // Este código pode não executar!
  });
</script>

<!-- ✅ CORRETO -->
<script lang="ts">
  import { browser } from '$app/environment';
  
  let initialized = $state(false);
  
  $effect(() => {
    if (browser && !initialized) {
      initialized = true;
      // Código de inicialização aqui
    }
  });
</script>
```

### Runes do Svelte 5

Sempre usar as runes modernas:

```svelte
<script lang="ts">
  // Estado reativo
  let count = $state(0);
  let items = $state<string[]>([]);
  
  // Valores derivados
  let doubled = $derived(count * 2);
  let total = $derived(items.length);
  
  // Props
  let { name, age = 18 }: { name: string; age?: number } = $props();
  
  // Efeitos colaterais
  $effect(() => {
    console.log('count mudou:', count);
  });
</script>
```

### Event Handlers

Usar funções JavaScript, não strings:

```svelte
<!-- ❌ ERRADO -->
<button onmouseover="this.style.color='red'">

<!-- ✅ CORRETO -->
<button onmouseenter={(e) => e.currentTarget.style.color = 'red'}>
```

## Estrutura do Projeto

```
/
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/    # Componentes reutilizáveis
│   │   │   ├── stores/        # Stores (.svelte.ts para runes)
│   │   │   └── utils/         # Utilitários
│   │   ├── routes/            # Páginas SvelteKit
│   │   └── app.css            # Estilos globais e variáveis CSS
│   └── static/                # Assets estáticos
│
├── backend/
│   ├── src/
│   │   ├── routes/            # Rotas Express
│   │   ├── middleware/        # Middlewares
│   │   └── index.ts           # Entry point
│   ├── prisma/
│   │   └── schema.prisma      # Schema do banco
│   └── templates/             # Templates de relatórios
│
└── .kiro/
    ├── steering/              # Diretrizes do projeto
    └── specs/                 # Especificações de features
```

## Sistema de Temas

### CSS Variables

O tema usa variáveis CSS definidas em `frontend/src/app.css`:

```css
:root, .light {
  --bg-primary: #f8fafc;
  --bg-secondary: #f1f5f9;
  --text-primary: #0f172a;
  /* ... */
}

.dark {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #f8fafc;
  /* ... */
}
```

### Uso nos Componentes

Sempre usar variáveis CSS para cores que mudam com o tema:

```svelte
<div style="background-color: var(--bg-primary); color: var(--text-primary);">
```

## API Backend

- **Base URL:** `http://localhost:3000/api`
- **Autenticação:** Bearer token no header `Authorization`

### Endpoints Principais
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuário atual
- `GET /api/admin/users` - Listar usuários (admin)
- `POST /api/relatorios/*` - Gerar relatórios

## Stores (Svelte 5)

Os stores usam arquivos `.svelte.ts` com runes:

```typescript
// exemplo: auth.svelte.ts
let user = $state<User | null>(null);
let token = $state<string | null>(null);

export const auth = {
  get user() { return user; },
  get token() { return token; },
  get isAuthenticated() { return !!token && !!user; },
  
  login(userData: User, authToken: string) {
    user = userData;
    token = authToken;
  }
};
```

## Comandos

```bash
# Desenvolvimento (frontend + backend)
bun run dev

# Apenas frontend
cd frontend && bun run dev

# Apenas backend
cd backend && bun run dev

# Gerar Prisma Client (após mudar schema)
cd backend && bunx prisma generate

# Migrations
cd backend && bunx prisma migrate dev
```

## Erros Comuns e Soluções

### "Unknown argument" no Prisma
Rodar `bunx prisma generate` para regenerar o client.

### Componentes não renderizam / ficam em loading infinito
Verificar se está usando `onMount` - trocar por `$effect`.

### Tema não muda
Verificar se está usando `var(--variavel)` e não cores hardcoded.

### TypeScript errors com `$app/*`
São falsos positivos - o código funciona normalmente.
