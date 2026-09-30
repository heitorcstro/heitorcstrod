# Categoria nunca sai da pasta ao mudar de lugar

## O que acontece hoje (confirmado no código)
Quando você arrasta uma categoria (ex.: "Boxe") que está numa pasta e solta sobre outra categoria que não está nas mesmas pastas, o app entende isso como "tirar da pasta" e apaga o vínculo — por isso ela some da pasta. Soltar na área geral de categorias faz o mesmo. E se a categoria de destino estiver em outra pasta, o app abre a pergunta de mover para pasta em vez de só trocar de lugar.

## O que vai mudar
- Arrastar uma categoria para outra posição passa a só **trocar a ordem**. As pastas em que ela está continuam exatamente as mesmas.
- Soltar na área geral de categorias também não remove mais a categoria das pastas.
- Soltar em cima de outra categoria (esteja ela numa pasta ou não) nunca abre a pergunta de pasta — só reordena.
- Para entrar numa pasta: continua igual — soltar a categoria **em cima da pasta** (abre a pergunta atual).
- Para sair de uma pasta: continua igual — botão "Excluir Categoria da Pasta" dentro da pasta.
- Vale tanto na tela principal quanto na barra lateral.

## Não será alterado
Tempos de pressão (150 ms no Ok, 300 ms nos demais), layout das subcategorias (T à direita, linha única dos 5 botões), confirmação da lixeira, regras de "Urgente", cores e botões das pastas.

## Detalhes técnicos
- `src/routes/index.tsx`, `aoSoltarHierarquia`: remover o bloco `mesmaPasta`/`setPendenteMoverPasta`/`moverCategoriaParaPasta(..., null)` na reordenação; chamar apenas `reordenarCategorias(ativa, alvo)` (que usa `moverPorId`, preservando o objeto com `pastaIds`). No caso `sobreId === "raiz"`, não limpar `pastaIds` (no-op).
- `src/components/nirvana/sidebar-categorias.tsx`, `aoSoltar` (fallback sem `onSoltarHierarquia`): no caso `"raiz"`, não chamar `onMoverCategoriaParaPasta(id, null)`.
- `moverCategoriaParaPasta` deixa de ser usado para remoção implícita; remoção só pelas ações explícitas já existentes.
- Verificar com Playwright: colocar uma categoria numa pasta mantendo-a em Categorias, arrastá-la para outra posição e confirmar que continua na pasta (contador e view da pasta) após recarregar.
