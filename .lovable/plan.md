# Plano: Botões "+Criar" (preto) e lixinho+"Del." (vermelho) abaixo de Categorias

## Resumo
Aplicar exatamente a mesma mudança já feita na seção Pastas, agora na seção **Categorias** (área central e barra lateral): trocar os botões "Criar Categoria" e "Deletar Categoria" por dois botões compactos lado a lado — preto "+Criar" e vermelho lixinho+"Del.", conteúdo encostado à esquerda de cada quadrado.

## Detalhe visual / classes (idênticas às da seção Pastas já aplicada)
Cada botão:
- `inline-flex items-center justify-start gap-1.5 rounded-md pl-2 pr-3 py-2 text-sm font-medium transition-colors`
- Preto: `bg-black text-white hover:bg-black/90` + ícone `Plus` + "Criar"
- Vermelho: `bg-red-600 text-white hover:bg-red-700` + ícone `Trash2` + "Del."
- Container: `flex flex-row items-center gap-3`.

## Arquivo 1 — Área central: `src/routes/index.tsx` (≈ linhas 1209-1223)
Hoje dois `Button size="lg"`: "Criar Categoria" (`setModalAberto(true)`) e "Deletar Categoria" (`setModalDeletarAberto(true)`). Substituir por dois `<button>` com as classes acima, mantendo os mesmos `onClick` (modais inalterados).

## Arquivo 2 — Sidebar: `src/components/nirvana/sidebar-categorias.tsx` (≈ linhas 380-414)
Hoje duas caixas `CLASSE_ACAO` ("Criar Categoria" e "Deletar Categoria") seguidas da caixa "Pesquisar". Substituir as duas caixas por uma linha `flex flex-row items-center gap-3 border-b border-gray-200 px-4 py-3` com os dois botões compactos (`onCriarCategoria` / `onDeletarCategoria`). Manter o wrapper `secaoCategoriasAberta` e a caixa "Pesquisar" intactos.

## Escopo / preservação
- Apenas a seção **Categorias** (central + sidebar). Pastas já está pronta e não muda.
- Modais, handlers, DnD, accordion das seções, cartões e demais estilos permanecem intactos.
- `Plus` e `Trash2` já importados nos dois arquivos.

## Verificação
- `bunx tsgo --noEmit` sem erros.
- Playwright em `http://localhost:8080`: limpar localStorage, recarregar; confirmar que abaixo de "Categorias" (central e sidebar) aparecem os dois botões lado a lado (preto "+Criar", vermelho lixinho+"Del."), conteúdo encostado à esquerda; "+Criar" abre o modal de criar categoria e "Del." abre o de deletar; sem erros de console.
