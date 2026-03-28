# Submissao - Copiloto da Sorte (EDScript 2026)

Este arquivo existe para facilitar a vida da organizacao e da banca: links diretos, o que olhar primeiro e como auditar sem perder tempo.

## 1) Links (o que a banca precisa abrir)

### Pitch (obrigatorio)
- Apresentacao (PDF/PPT): **COLE AQUI**: `LINK_PITCH_PDF_OU_PPT`

### Codigo-fonte (obrigatorio)
- Repositorio Front-end: **COLE AQUI**: `LINK_REPO_FRONT`
- Repositorio Back-end (standalone): **COLE AQUI**: `LINK_REPO_BACK`

### Ambiente rodando (recomendado)
- Produto (Vercel): `LINK_VERCEL`
  - Pitch no sistema: `LINK_VERCEL/pitch`
  - Demo principal: `LINK_VERCEL/`
  - Prova objetiva: `LINK_VERCEL/prova`

### Design (opcional)
- Figma: `LINK_FIGMA`

---

## 2) O que e o Copiloto da Sorte (em 3 linhas)

O Copiloto da Sorte e uma feature premium de leitura esportiva ao vivo para futebol, integrada ao fluxo de uma sportsbook real.
Ele nao empurra aposta: ele traduz jogo + mercado em cenarios explicaveis, com mudanca de contexto ao longo do tempo.
A interface prioriza clareza e decisao: descoberta com microinsights, leitura aprofundada e prova objetiva da consistencia.

---

## 3) O que olhar em 60 segundos (para jurado)

1. Abra `LINK_VERCEL/pitch` e avance as 3 telas (atalhos 1/2/3 e setas).
2. Clique em **Ir para demo** e abra um jogo ao vivo.
3. Veja, na ordem:
   - Leitura do Copiloto (topo)
   - Janela Temporal (o que mudou e por que)
   - Campo Premium Ao Vivo (pressao + eventos recentes + risco de virada)
   - Cenarios principais (resultado / gols / momento) com drivers
4. Abra `LINK_VERCEL/prova` (prova objetiva): coleta, integridade da probabilidade e evolucao de acerto.

---

## 4) O diferencial (explicacao direta)

- Em vez de um chatbot solto ou um painel poluido, o produto entrega **leitura explicavel** e **mudanca de cenario**.
- A lista de jogos ja entrega valor (microinsights) e ajuda a priorizar o que acompanhar.
- A prova objetiva mostra que a leitura nao e "achismo": existe consistencia matematica e auditoria por checkpoints.

---

## 5) Dados usados (sem aula tecnica)

- Live: BetsAPI (status, odds, estatisticas live; XY/Bet365 quando disponivel).
- Historico/contexto: StatsBomb Open Data (quando cobertura profunda).
- Jogadores/contexto: FBref (fallback de destaques quando necessario).

---

## 6) Observacoes para auditoria tecnica

- Se algum dado nao estiver disponivel para um jogo especifico (ex.: confronto, lineup, XY), a UI mostra isso de forma honesta, sem inventar.
- O back-end expoe um endpoint de auditoria: `/api/v1/admin/prediction-audit` (visivel na pagina `/prova`).

