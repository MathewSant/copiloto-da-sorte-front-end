# Copiloto da Sorte Front-end

Front-end oficial do **Copiloto da Sorte**, uma feature premium de leitura esportiva ao vivo integrada ao ecossistema de sportsbook.

Este app entrega:
- descoberta de jogos ao vivo com microinsights;
- leitura aprofundada de partida com cenários explicáveis;
- painel lateral de contexto e ações;
- perguntas dinâmicas para o Copiloto;
- tela de prova objetiva de consistência e assertividade.

---

## 1) Stack e tecnologia

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Radix UI + componentes utilitários**
- **Vercel Analytics**

---

## 2) Requisitos

- **Node.js** 20+ (recomendado)
- **pnpm** 10+
- Backend ativo em `copilot_backend` (API `/api/v1`)

---

## 3) Configuração de ambiente

Crie o arquivo local de ambiente:

```bash
cp .env.local.example .env.local
```

Valor padrão:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Em produção, a variável deve apontar para a URL pública do backend já com o prefixo `/api/v1`.

---

## 4) Como rodar

Instalar dependências:

```bash
pnpm install
```

Desenvolvimento:

```bash
pnpm dev
```

Build de produção:

```bash
pnpm build
```

Subir build:

```bash
pnpm start
```

Lint:

```bash
pnpm lint
```

---

## 5) Rotas principais

- `/`  
  Experiência principal do Copiloto (Ao Vivo, Próximos, Minha Rodada, detalhe completo).

- `/prova`  
  Tela de prova objetiva baseada em dados reais de auditoria do backend.

---

## 6) Integração com API (consumida por este front)

Endpoints usados:

- `GET /bootstrap`
- `GET /matches/{match_id}`
- `GET /matches/by-event/{event_id}`
- `GET /matches/by-context?...`
- `POST /assistant/answer`
- `GET /admin/prediction-audit`

Todos são resolvidos a partir de `NEXT_PUBLIC_API_BASE_URL`.

---

## 7) Comportamento em tempo real

### Polling

- Bootstrap (shortlist, contadores, seleção): **30s**
- Detalhe da partida selecionada: **20s**

### Cache local (localStorage)

- Bootstrap cache: `copilot.cache.bootstrap.v1` (TTL ~120s)
- Detalhe por jogo: `copilot.cache.detail.v1:{matchId}` (TTL ~90s)
- Minha Rodada: `copilot-my-round-v1`

Objetivo: reduzir sensação de recarga total e manter continuidade visual entre ciclos de atualização.

---

## 8) Modo embed (integração em shell de sportsbook)

A rota principal aceita parâmetros para embutir o Copiloto no detalhe da casa:

- `embed=1`
- `eventId`
- `homeTeam`
- `awayTeam`
- `league`
- `status` (`live` ou `upcoming`)

Exemplo:

```text
/?embed=1&eventId=72723729&homeTeam=Brazil&awayTeam=France&status=live
```

Fluxo:
1. tenta vincular via `eventId`;
2. se não encontrar, tenta `by-context`;
3. renderiza melhor leitura disponível sem quebrar UX.

---

## 9) Estrutura de pastas (resumo)

```text
app/
  page.tsx              # orquestração da experiência principal
  prova/page.tsx        # prova objetiva
  layout.tsx            # metadata + tema base

components/copilot/
  header.tsx
  matches-sidebar.tsx
  main-content.tsx
  context-sidebar.tsx
  match-header.tsx
  live-field-premium.tsx
  live-pulse-strip.tsx
  scenario-card.tsx
  match-timeline.tsx
  team-comparison.tsx

lib/
  api.ts                # client HTTP + timeout + cache
  copilot-types.ts      # contratos tipados do domínio
  my-round.ts           # persistência de jogos fixados
  fallback-data.ts      # fallback/transiente da UI
```

---

## 10) Decisões importantes de produto no front

- IA é **subordinada à interface**, não chatbot central.
- Perguntas ao Copiloto são **dinâmicas por jogo** e há pergunta personalizada.
- Leitura principal privilegia:
  - contexto atual do jogo;
  - cenário provável e confiança;
  - sinais que sustentam/invalidam leitura;
  - mudança de cenário ao longo da janela.
- Campo Premium Ao Vivo suporta modos:
  - `advanced_xy`
  - `proxy_pressure`
  - `fallback_stats`
  - `upcoming_waiting`

---

## 11) Deploy recomendado

### Front-end (Vercel)

Definir variável de ambiente:

```env
NEXT_PUBLIC_API_BASE_URL=https://SEU_BACKEND_PUBLICO/api/v1
```

### Backend

Pode estar em VM/container/túnel (ex.: cloudflared), desde que:
- URL seja pública e estável;
- CORS permita o domínio do front;
- endpoints `/api/v1/*` estejam acessíveis.

---

## 12) Troubleshooting rápido

### Tela sem jogos ou erro de carga

- confirmar backend ativo;
- validar `NEXT_PUBLIC_API_BASE_URL`;
- testar `GET /api/v1/bootstrap` diretamente;
- verificar CORS no backend.

### `/prova` não carrega

- conferir se `GET /api/v1/admin/prediction-audit` está respondendo.

### Mudanças locais não aparecem

- limpar cache do navegador (localStorage);
- reiniciar `pnpm dev`.

---

## 13) Observações operacionais

- O front foi desenhado para funcionar com dados reais e também com fallback transitório sem quebrar fluxo.
- `next.config.mjs` está com `typescript.ignoreBuildErrors: true`; para maior rigor em CI, recomenda-se validar tipos com:

```bash
pnpm exec tsc --noEmit
```

