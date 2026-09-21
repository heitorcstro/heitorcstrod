# Plano: Bloco "Pastas" na área central

## Resumo
Na tela inicial da área central (quando nenhuma categoria está selecionada), adicionar um novo cabeçalho **Pastas** acima do cabeçalho **Categorias** existente, espelhando a mesma formatação e os mesmos dois botões de ação.

## O que vai mudar
Arquivo único: `src/routes/index.tsx`, dentro do bloco da tela inicial (ramo `else`, antes do cabeçalho "Categorias" atual, por volta da linha 614).

### Novo bloco "Pastas" (acima do bloco "Categorias")
- Container igual ao do cabeçalho Categorias: `flex flex-wrap items-end justify-between gap-4`.
- Título `Pastas` usando exatamente a mesma classe do título "Categorias":
  `font-display text-3xl font-semibold tracking-tight`.
- Cluster de botões à direita, copiando o padrão dos botões "Criar Categoria"/"Deletar Categoria":
  - `Criar Pasta` → `Button size="lg"` com ícone `Plus`, abre o modal de criar pasta (`setModalPastaAberto(true)`).
  - `Deletar Pasta` → `Button size="lg"` vermelho (`bg-red-600 text-white hover:bg-red-700`) com ícone `Trash2`, abre o modal de deletar pasta (`setModalDeletarPastaAberto(true)`).

### Reaproveitamento
- Os modais "Criar Pasta" (`modalPastaAberto`) e "Deletar Pasta" (`modalDeletarPastaAberto`) já existem e já estão ligados aos handlers `criarPasta` e `excluirPasta`. Nenhuma lógica nova é necessária — apenas os botões para abri-los.
- Os ícones `Plus` e `Trash2` já estão importados no arquivo.

## Escopo / preservação
- Apenas título + os dois botões; **não** listar as pastas criadas no centro (decisão confirmada).
- Não alterar a sidebar, os cartões de categoria, o DnD, a master-detail, as barras de progresso nem os modais existentes.
- O bloco "Pastas" aparece somente na tela inicial da área central (mesmo ramo onde o título "Categorias" aparece), não nas views de Arquivados / CategoriaView / ListaView.

## Verificação
- `tsgo` typecheck sem erros.
- Playwright: abrir `http://localhost:8080`, limpar localStorage, recarregar e confirmar que "Pastas" aparece acima de "Categorias" com os dois botões; clicar em "Criar Pasta" abre o modal; sem erros de console.
