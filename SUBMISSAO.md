# Submissão - Copiloto da Sorte (EDScript 2026)

Este documento organiza, em leitura rápida, os principais links e o que a banca deve observar primeiro no produto.

## 1. Links principais

### Apresentação do pitch
- Pitch dentro do próprio produto: `https://copiloto-da-sorte-front-end.vercel.app/pitch`

### Código-fonte
- Repositório Front-end: `https://github.com/MathewSant/copiloto-da-sorte-front-end`
- Repositório Back-end: `https://github.com/MathewSant/copiloto-da-sorte-back-end`

### Ambiente consultável
- Produto: `https://copiloto-da-sorte-front-end.vercel.app/`
- Pitch no sistema: `https://copiloto-da-sorte-front-end.vercel.app/pitch`
- Demo principal: `https://copiloto-da-sorte-front-end.vercel.app/`
- Prova objetiva: `https://copiloto-da-sorte-front-end.vercel.app/prova`

### Vídeo de apoio
- Vídeo curto da solução: `https://youtu.be/-HZcN4PAiuU`

---

## 2. O que é o Copiloto da Sorte

O Copiloto da Sorte é uma feature premium de leitura esportiva ao vivo para futebol, pensada para o contexto de uma sportsbook.

Em vez de mostrar apenas odds, placar e estatísticas soltas, o produto organiza o jogo em leitura clara: o que está acontecendo, o que pode acontecer e por quê.

A experiência combina descoberta de jogos, leitura aprofundada da partida e uma camada de prova objetiva para auditoria.

---

## 3. O que olhar primeiro, em 60 segundos

1. Abra `https://copiloto-da-sorte-front-end.vercel.app/pitch`.
2. Avance pelas três etapas do pitch dentro do sistema.
3. Clique em **Ir para demo** e abra uma partida ao vivo.
4. Observe, na ordem:
   - leitura do topo;
   - janela temporal;
   - campo premium ao vivo;
   - cenários principais com explicação curta;
   - perguntas sugeridas do Copiloto.
5. Abra `https://copiloto-da-sorte-front-end.vercel.app/prova` para validar a camada de auditoria.

---

## 4. O diferencial do produto

- Não é um chatbot genérico.
- Não é um painel poluído de números.
- Não é um palpite seco de aposta.

O produto entrega leitura explicável, mostra mudança de cenário ao longo do tempo e ajuda o usuário a entender melhor o jogo ao vivo.

---

## 5. O que é real e auditável na solução

- O front-end está disponível publicamente para navegação.
- O pitch foi incorporado ao próprio sistema, sem depender de apresentação externa.
- Existe uma página de prova objetiva (`/prova`) dedicada à validação da lógica apresentada.
- A solução foi construída com dados reais do desafio, respeitando disponibilidade e limitações de cobertura por partida.

---

## 6. Observações para a banca

- Quando algum dado não está disponível para um jogo específico, a interface sinaliza isso com transparência.
- A solução prioriza clareza de leitura e explicabilidade, não volume bruto de dados.
- O objetivo central do produto é reduzir ruído e transformar contexto esportivo em entendimento rápido.
