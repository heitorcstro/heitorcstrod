# Ajustar o deslocamento do pino para 0,05 cm (cartão de categoria central)

## Objetivo
Reduzir o deslocamento do pino de arraste no cartão central de 0,1 cm para **0,05 cm** para a esquerda, mantendo o mesmo tamanho (caixa `h-8 w-8`, pino `h-7 w-7`). O vão entre o pino e o botão "+" passa a ser de 0,05 cm (~1,9px). Apenas na área central; sidebar e pastas continuam inalteradas.

## Estado atual (confirmado)
`src/routes/index.tsx`, função `cartaoCategoria`:
- Linha ~612: `alcaBoxClassName="h-8 w-8 -ml-[0.1cm]"` (pino deslocado 0,1 cm à esquerda).
- Linha ~673: botão "+" com `ml-[0.1cm]` no `className` (mantém o "+" no lugar e abre o vão de 0,1 cm).

## Mudança
Em `src/routes/index.tsx`, dentro de `cartaoCategoria`:
1. Trocar `-ml-[0.1cm]` por `-ml-[0.05cm]` no `alcaBoxClassName`.
2. Trocar `ml-[0.1cm]` por `ml-[0.05cm]` no botão "+".

Resultado: pino em x₀ − 0,05cm, "+" em x₀, vão = 0,05cm (~1,9px).

## Verificação
- Typecheck (`tsgo`) sem erros.
- Playwright: medir `plusLeft − boxRight` no cartão central, esperado ~1,89px; confirmar tamanho da caixa (32px) e do pino (28px) inalterado.
