# Ajuste do pino de arraste: +0,1 cm à esquerda

## Objetivo
Mover o símbolo do pino de arraste (drag handle) mais **0,1 cm para a esquerda** no cartão central de categoria, **mantendo o mesmo tamanho**.

## Estado atual (confirmado no código)
- `src/routes/index.tsx` linha 612 — caixa do pino: `alcaBoxClassName="h-8 w-8 -ml-[0.05cm]"`
- `src/routes/index.tsx` linha 613 — imagem do pino: `alcaImgClassName="h-7 w-7"`
- `src/routes/index.tsx` linha 673 — botão "+": `className="ml-[0.05cm] ... size-8 ..."`
- O pino e o "+" estão no mesmo contêiner `flex flex-row items-center` (linhas 667–676).

## Mudança
Aumentar o deslocamento à esquerda do pino de `0,05 cm` para `0,15 cm`:

- Linha 612: `alcaBoxClassName="h-8 w-8 -ml-[0.15cm]"`

### O que NÃO muda
- Tamanho do pino: caixa `h-8 w-8`, imagem `h-7 w-7` (inalterados).
- Botão "+": permanece com `ml-[0.05cm]` e `size-8`.
- Sidebar, pastas, itens e subcategorias: sem alteração (continuam com caixa `h-6 w-6` e ícone `h-5 w-5`, sem deslocamento).
- Listeners de arraste (dnd-kit): preservados.

## Resultado
O vão entre o pino e o botão "+" aumentará em ~0,1 cm (de ~0,05 cm para ~0,15 cm), sem alteração de tamanho.

## Verificação
- Typecheck.
- Medição via Playwright (`getBoundingClientRect` do pino e do "+") confirmando o novo vão ≈ 0,15 cm (~5,7px).
