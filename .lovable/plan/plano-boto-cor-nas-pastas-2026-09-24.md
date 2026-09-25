# Plano: botão “cor” nas Pastas

## Objetivo
Adicionar a cada cartão da seção central **Pastas** um botão “cor” idêntico ao dos cartões de categoria, permitindo mudar dinamicamente a cor do ícone da pasta.

## Mudanças
- Criar a atualização de cor da pasta no estado global, preservando nome, conteúdo, ordem e arquivamento.
- No cartão central de cada pasta, manter nome e contador à esquerda e reunir à direita, com alinhamento vertical e `gap-2`, o botão “cor”, a seta e o pino de arraste.
- Reutilizar `TrocarCorCategoria` com `rotulo="cor"`, garantindo exatamente o mesmo estilo e menu de cores já utilizado.
- Manter todo o grupo dentro da borda arredondada do cartão.

## Preservação estrita
- Não alterar a sidebar nem qualquer cartão de Categoria ou Subcategoria.
- Não alterar setas das categorias, ordem dos cinco botões, espaçamentos `mt-[8px]`/`pb-[50px]`, prioridades ou camadas z-index.

## Verificação
- Confirmar no navegador que o menu abre e que a escolha muda somente o ícone da pasta, inclusive após recarregar.
- Conferir contenção e alinhamento em tela móvel e desktop, sem erros no aplicativo.
