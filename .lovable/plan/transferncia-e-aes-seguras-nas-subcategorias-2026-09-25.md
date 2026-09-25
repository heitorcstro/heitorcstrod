# Transferência e ações seguras nas subcategorias

## Objetivo
- Reorganizar somente o cabeçalho de cada subcategoria, mantendo nome e contagem à esquerda e adicionando um botão azul “T” isolado à direita.
- Abrir pelo botão “T” uma seleção de destino organizada por pastas e categorias; pastas revelarão suas categorias, pois a subcategoria continuará pertencendo a uma categoria.
- Transferir a subcategoria inteira, com todos os itens e propriedades, removendo-a apenas da categoria de origem e acrescentando-a à categoria escolhida.
- Manter os cinco controles em uma única linha, nesta ordem: “Mov. Sub”, “Ok”, “X”, lápis e lixeira.
- Preservar a confirmação obrigatória antes da exclusão definitiva.

## Preservação
- Não alterar o campo branco de novo item.
- Não alterar cabeçalhos de categorias nem cartões de pastas.
- Manter os espaçamentos, camadas e comportamento visual existentes fora do cabeçalho da subcategoria.

## Detalhes técnicos
- Criar um diálogo específico para transferência de subcategoria, com destinos agrupados entre categorias soltas e pastas.
- Encaminhar categorias e pastas até o acordeão e atualizar o estado global de categorias de forma atômica.
- Impedir a escolha da categoria atual e fechar o diálogo somente após uma escolha válida.
