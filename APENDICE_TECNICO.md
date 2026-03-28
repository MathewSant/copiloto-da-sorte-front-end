# Apêndice Técnico

Este documento foi pensado para leitura rápida pela banca. O objetivo é explicar, sem excesso de jargão, como a solução transforma dados em uma experiência de análise esportiva compreensível.

## 1. Base da solução

O Copiloto da Sorte trabalha com futebol ao vivo e usa três camadas principais de informação:

- dados ao vivo para acompanhar a partida em andamento;
- histórico e contexto para comparar o jogo atual com padrões anteriores;
- referências de jogadores para enriquecer leituras quando esse contexto está disponível.

O foco do produto não é despejar dados. O foco é transformar sinais em leitura clara.

## 2. Como a leitura vira produto

A solução organiza a interpretação da partida em blocos simples de entender:

- quem está impondo mais ritmo;
- se o cenário está mudando;
- se há pressão crescente;
- se o contexto aponta para resultado, gols ou equilíbrio.

Esses sinais aparecem de forma visual e textual. O produto sempre tenta responder três perguntas:

1. o que está acontecendo;
2. o que pode acontecer;
3. por que o sistema está dizendo isso.

## 3. O que existe de prova objetiva

Além da experiência visual, existe uma rota específica de auditoria em:

`https://copiloto-da-sorte-front-end.vercel.app/prova`

Essa página existe para mostrar que a solução não depende apenas de interface. Ela reúne indicadores de consistência, histórico de leituras e elementos de validação do comportamento do sistema.

## 4. Transparência e limites

Nem toda partida oferece a mesma profundidade de cobertura. Em alguns jogos, certos dados podem não estar disponíveis.

Quando isso acontece, a solução não inventa contexto. Ela sinaliza a indisponibilidade e segue com os sinais realmente disponíveis para aquela partida.

## 5. Critério de produto

A tese central da solução é simples:

em vez de um chatbot genérico, um painel lotado de estatísticas ou um palpite seco, o Copiloto da Sorte entrega leitura explicável para ajudar o usuário a entender melhor o jogo ao vivo.
