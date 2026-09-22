# Pino de arrasto: maior, preto sólido e colado no botão "+"

## Objetivo
O ícone de arrasto (pino de mapa em `/drag-icon.png`) deve ficar **maior**, **preto sólido** (sem o fade cinza atual) e, no cartão de categoria central, **colado ao botão "+"** (Adicionar Subcategoria). A caixa branca com borda preta ao redor do pino é mantida.

## Decisões confirmadas com o usuário
- **Local do "+":** apenas no cartão de categoria da área central (único lugar onde pino e + ficam lado a lado hoje).
- **Caixa do pino:** manter a caixa branca com borda preta.
- **Tamanho do pino:** 28px.

## Alterações

### 1. `src/components/nirvana/dnd.tsx` — renderização `alcaIcone` do `ItemOrdenavel`
- Adicionar duas props opcionais: `alcaBoxClassName?: string` e `alcaImgClassName?: string`.
- Refatorar a `className` do `<span>` (ramo `alcaIcone`) para usar `cn(...)` com defaults e permitir override:
  - box default: `group inline-flex h-6 w-6 shrink-0 cursor-grab touch-none select-none items-center justify-center rounded-md border border-black bg-white p-0 transition-colors hover:bg-black/5 active:cursor-grabbing`
  - `alcaBoxClassName` entra no `cn` para sobrescrever dimensões quando informado.
- `<img>`:
  - Remover `opacity-60`/`group-hover:opacity-100` → pino sempre **preto sólido** (`opacity-100`).
  - Default `h-4 w-4`; aplicar `alcaImgClassName` (ex.: `h-7 w-7`) quando informado.
- Listener/atributos dnd-kit permanecem no `<span>`; `<img>` segue `pointer-events-none` e `draggable={false}`. `aria-label` mantido.

### 2. `src/routes/index.tsx` — `cartaoCategoria` (linhas ~605–694)
- Passar para o `ItemOrdenavel` do cartão: `alcaBoxClassName="h-8 w-8"` e `alcaImgClassName="h-7 w-7"` (pino 28px, caixa 32px = mesma do botão "+", que é `size-8`).
- Reestruturar o cluster superior direito (linhas ~664–694) de duas colunas separadas por `gap-6` para uma única linha colada:
  ```
  [pino colado no +] [gap-1.5] [Arquivar]
  ```
  - Envolver `{alca}` e o botão `+` (Adicionar Subcategoria) num mesmo `<div className="flex flex-row items-center">` (sem gap → colados).
  - Manter `gap-1.5` entre esse grupo e o `BotaoArquivar`.
  - Container externo: `absolute top-3 right-3 z-10 flex flex-row items-center gap-1.5`.
  - Botão "+" e `BotaoArquivar` permanecem `size-8`, borda preta, fundo branco — visualmente o pino e o "+" viram um par de controles quadrados encostados.

### 3. Demais alças de arrasto (sidebar e linhas de pasta central) — `dnd.tsx`/`index.tsx`/`sidebar-categorias.tsx`
- Sem gluing (não há "+" adjacente).
- Aproveitar as novas props para tornar o pino **preto sólido** e um pouco **maior**, sem quebrar o alinhamento estrito da sidebar (slots `w-5` chevron + `w-6` alça preservados):
  - Caixa permanece `h-6 w-6` (default).
  - Pino cresce de `h-4 w-4` para `h-5 w-5` e fica sólido (override via `alcaImgClassName="h-5 w-5"` apenas, ou alterar o default). A escolha entre mudar o default global ou passar a prop será feita na implementação mantendo a sidebar intacta.

## Nota de alinhamento
Aumentar o pino para 28px exige uma caixa ≥28px. Na sidebar o slot da alça é `w-6` (24px) e foi definido como preservação estrita em prompts anteriores — por isso o tamanho 28px é aplicado somente no cartão central (caixa `size-8`), e a sidebar/pasta recebem só o preto sólido + aumento moderado (`h-5`) dentro da caixa atual, sem alterar `w-5`/`w-6`.

## Verificação
- Typecheck (`tsgo`).
- Playwright: abrir home, limpar localStorage, recarregar; screenshot do cartão central confirmando pino preto 28px encostado no "+" e par com o Arquivar; checar sidebar sem quebra de alinhamento dos slots; confirmar arrasto ainda funciona (listeners no `<span>`).
- Console sem erros.
