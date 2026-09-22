# Plano: Botões "+Criar" (preto) e lixinho+"Del." (vermelho) abaixo de Pastas

## Resumo
Abaixo do cabeçalho **Pastas**, trocar os botões atuais "Criar Pasta" e "Deletar Pasta" por dois botões compactos lado a lado:
- **Quadrado preto**: ícone `+` + texto "Criar" (conteúdo encostado à esquerda do próprio quadrado).
- **Quadrado vermelho**: ícone `Trash2` + texto "Del." (conteúdo encostado à esquerda do próprio quadrado).

Aplicado nos **dois** blocos de Pastas: área central e barra lateral.

## Detalhe visual / classes
Cada botão será um "quadrado" preenchido, arredondado, com conteúdo alinhado à esquerda:
- Container de cada botão: `inline-flex items-center gap-1.5 justify-start rounded-md pl-2 pr-3 py-2 text-sm font-medium` + cor.
  - `justify-start` + `pl-2` (padding esquerdo mínimo) deixa o conteúdo "o mais à esquerda possível dentro do próprio quadrado", conforme pedido.
- Preto: `bg-black text-white hover:bg-black/90`.
- Vermelho: `bg-red-600 text-white hover:bg-red-700`.
- Tamanho compacto e consistente entre os dois (mesma `py-2` e `text-sm`).
- Os dois ficam lado a lado em `flex flex-row items-center gap-3`.

Texto: o botão de criar mostra o ícone `Plus` seguido de "Criar" (lendo "+Criar"); o de deletar mostra o ícone `Trash2` seguido de "Del.".

## Arquivo 1 — Área central: `src/routes/index.tsx` (≈ linhas 1087-1101)
Hoje o bloco renderiza dois `Button size="lg"`:
- `Criar Pasta` (com `Plus`) → abre `setModalPastaAberto(true)`.
- `Deletar Pasta` (com `Trash2`, vermelho) → abre `setModalDeletarPastaAberto(true)`.

Substituir por dois botões `<button>` com as classes acima, mantendo os mesmos `onClick` (modais inalterados). O container `flex flex-row items-center gap-3` que já existe pode ser reaproveitado.

## Arquivo 2 — Sidebar: `src/components/nirvana/sidebar-categorias.tsx` (≈ linhas 266-293)
Hoje há duas caixas de ação full-width (`CLASSE_ACAO`): "Criar Pasta" e "Deletar Pasta", seguidas da caixa "Pesquisar".
- Substituir essas duas caixas por uma única linha `flex flex-row items-center gap-3` contendo os dois botões compactos (preto "+Criar" e vermelho lixinho+"Del.").
- `onClick` continuam chamando `onCriarPasta` e `onDeletarPasta`.
- Manter o wrapper condicional `secaoPastasAberta` e a caixa "Pesquisar" (`caixaPesquisa`) intactos.

## Escopo / preservação
- Apenas a seção **Pastas** (central + sidebar). A seção **Categorias** não muda.
- Modais, handlers, DnD, accordion das seções, cor das pastas, cartões e demais estilos permanecem intactos.
- Ícones `Plus` e `Trash2` já estão importados nos dois arquivos; nenhuma dependência nova.

## Verificação
- `bunx tsgo --noEmit` sem erros.
- Playwright em `http://localhost:8080`: limpar localStorage, recarregar; confirmar que abaixo de "Pastas" (central e sidebar) aparecem os dois botões lado a lado (preto "+Criar", vermelho lixinho+"Del."), com o conteúdo encostado à esquerda; clicar em "+Criar" abre o modal de criar pasta e em "Del." abre o de deletar; sem erros de console.
