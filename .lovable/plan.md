# Ajuste do texto da alça de arraste

## Objetivo
Inverter o texto exibido nas alças de arraste entre a barra lateral e a área central.

## Estado atual (verificado)
- **Sidebar** (`src/components/nirvana/sidebar-categorias.tsx`, linhas 191 e 332): categoria e pasta usam
  `alcaTexto="Mudar de Posição"` com `alcaClassName={CLASSE_ALCA_SIDEBAR}` (pílula preta/branca, `text-[10px]`).
- **Área central** (`src/routes/index.tsx`):
  - Cartão de categoria (linha 610): `alcaLetra="M"` com borda azul.
  - Cartão de pasta (linhas 1120-1126): sem `alcaLetra`, exibe o `textoAlca="Mover pasta"` com borda azul.

## Mudanças
1. **Sidebar — voltar para "M"**
   - Em `sidebar-categorias.tsx`, substituir nas duas linhas (categoria ~191 e pasta ~332):
     - `alcaTexto="Mudar de Posição" alcaClassName={CLASSE_ALCA_SIDEBAR}`
     - por `alcaLetra="M"`
   - Remover a constante `CLASSE_ALCA_SIDEBAR` e seu comentário, já que não terão mais uso.

2. **Área central — trocar "M" por "Trocar de Posição"**
   - No cartão de categoria (`index.tsx` linha 610): trocar `alcaLetra="M"` por `alcaTexto="Trocar de Posição"`, mantendo o `alcaClassName` azul existente e `textoAlca="Mover categoria"`.
   - No cartão de pasta (`index.tsx` linha ~1124): trocar para `alcaTexto="Trocar de Posição"` (em vez do `textoAlca="Mover pasta"` isolado), reaproveitando o mesmo `alcaClassName` azul, para uniformizar categoria e pasta na área central.

## Preservação
- DnD, listeners e atributos de `useSortable`/`useDroppable` permanecem intactos.
- Cores, tamanhos, posições e estilos (azul na central, preto/branco na sidebar) não mudam.
- A função de arraste continua idêntica.

## Verificação
- `bunx tsgo --noEmit` para typecheck.
- Playwright: confirmar na sidebar a letra "M" e na área central o texto "Trocar de Posição" em categoria e pasta, sem erros de console e layout preservado.
