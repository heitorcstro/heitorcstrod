# Plano: Fonte menor da subcategoria + cor da categoria visível ao abrir

## Objetivo
1. Reduzir a fonte da subcategoria (nome e contador) para um tamanho menor e mais compacto.
2. Ao abrir uma subcategoria (ex.: dentro da categoria laranja "Boxe"), o fundo branco do cartão da subcategoria não deve cobrir a cor da categoria — a cor da categoria deve continuar visível ao redor/atrás do conteúdo aberto.

## Mudanças

### 1. Fonte menor da subcategoria (`src/components/nirvana/subcategorias-accordion.tsx`)
- Nome da subcategoria: de `text-2xl font-bold` para `text-base font-semibold` (linha ~257).
- Contador "X pendentes · Y itens": de `text-sm` para `text-xs` (linha ~264).
- Total em BRL (modo compras): de `text-sm` para `text-xs` (linha ~272).
- Input de renomeação: de `text-lg` para `text-base` (linha ~250).

### 2. Branco não invade a cor da categoria
- Cartão da subcategoria (`AccordionItem`, linha ~223): trocar `bg-card` por `bg-white/70` (branco translúcido) — a cor da categoria aparece suavemente atrás, sem perder legibilidade do texto. Estado arquivado mantém `bg-gray-100 opacity-60`.
- Lista de itens marcados (linha ~430): trocar `bg-white` por `bg-transparent`.
- Botões de ação (Ok, X, Renomear, Arquivar, Excluir, "Mov. Sub") mantêm fundo branco sólido — são pequenos e precisam de contraste; não cobrem área relevante.

### 3. Preservação estrita
- Não alterar: ciclo de cores do item por toque, gestos (toque = prioridade, 2s = marcar/desmarcar), DnD, ordem das ações (Mov. Sub → Renomear → Ok → X → Arquivar/Excluir), sidebar, overlay.

## Verificação
- Typecheck.
- Playwright (viewport 394px): abrir uma categoria colorida (ex.: "Urgente" ou criar categoria laranja "Boxe"), abrir a subcategoria e confirmar via screenshot que a cor da categoria é visível atrás do cartão aberto e que a fonte está menor. Sem erros de console.
