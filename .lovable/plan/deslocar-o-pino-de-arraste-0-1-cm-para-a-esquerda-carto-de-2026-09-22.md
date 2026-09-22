# Deslocar o pino de arraste 0,1 cm para a esquerda (cartão de categoria central)

## Objetivo
No cartão de categoria da área central, o ícone de arraste (pino) deve **manter o tamanho atual** (caixa `h-8 w-8`, pino `h-7 w-7`) e **se deslocar 0,1 cm para a esquerda**, abrindo um pequeno vão de 0,1 cm entre ele e o botão "+" colado à sua direita.

Aplicado apenas na área central; a sidebar e as pastas permanecem inalteradas.

## Estado atual (confirmado)
- `src/routes/index.tsx`, função `cartaoCategoria`, linhas 666–677:
  - Container do cluster superior direito: `<div className="absolute top-3 right-3 z-10 flex flex-row items-center gap-1.5">`.
  - Sub-linha sem gap entre pino e "+": `<div className="flex flex-row items-center">` contendo `{alca}` (o `ItemOrdenavel` com `alcaIcone`, `alcaBoxClassName="h-8 w-8"`, `alcaImgClassName="h-7 w-7"`) e o botão "+" (`size-8`).

## Mudança
Em `src/routes/index.tsx`, dentro de `cartaoCategoria`:

1. **Pino**: adicionar `-ml-[0.1cm]` ao `alcaBoxClassName` →
   `alcaBoxClassName="h-8 w-8 -ml-[0.1cm]"`
   - A caixa mantém `h-8 w-8` e o pino `h-7 w-7` (tamanho preservado).
   - A caixa inteira é puxada 0,1 cm para a esquerda.

2. **Botão "+"**: adicionar `ml-[0.1cm]` ao `className` do botão de adicionar subcategoria para que ele permaneça em sua posição original e o vão de 0,1 cm se abra entre pino e "+".
   - Resultado: pino em x₀ − 0,1cm, "+" em x₀, vão = 0,1cm.

3. Preservar o `gap-1.5` do cluster externo e o restante da disposição (Arquivar/Restaurar à direita do "+").

## Verificação
- Typecheck (`tsgo`) sem erros.
- Playwright: screenshot do cartão central confirmando o pino a 0,1 cm do "+" (pequeno vão visível), mesmo tamanho do pino, e cluster/Arquivar alinhados.
- Checar que a sidebar e os cartões de pasta continuam sem o deslocamento.
