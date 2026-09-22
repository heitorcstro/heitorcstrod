# Troca de rótulos das ações em massa

Alteração puramente visual no header das subcategorias em
`src/components/nirvana/subcategorias-accordion.tsx` (linhas ~306–327).

## O que muda

1. **Botão "Marcar Tudo" → "Ok"**
   - Substituir o conteúdo de texto `Marcar Tudo` por `Ok`.
   - Manter `onClick` (`onMarcarTodos(sub.id, true)`), `stopPropagation`,
     `estiloBaseAcao` e a cor verde (`text-green-700 font-bold`).
   - Manter `disabled={sub.itens.length === 0}`.

2. **Botão "Desmarcar Tudo" → quadrado vermelho "X"**
   - Remover o texto `Desmarcar Tudo`.
   - Renderizar como conteúdo do botão o elemento:
     ```tsx
     <div className="flex size-5 shrink-0 items-center justify-center rounded-sm border border-black bg-white">
       <span className="text-sm font-bold leading-none text-red-500">X</span>
     </div>
     ```
   - No botão, remover o `px-2 py-1` (padding) herdado do `estiloBaseAcao`
     para que o quadrado fique colado/tight — usar uma variante sem padding
     (ex.: `${estiloBaseAcao} p-0`) ou classe própria mantendo
     `border-black bg-white rounded-md`.
   - Manter `onClick` (`onMarcarTodos(sub.id, false)`), `stopPropagation`
     e `disabled={sub.itens.length === 0}`.

## Preservação estrita

- Não alterar o `onClick` nem a função `onMarcarTodos`.
- Não alterar o layout flex (`flex min-w-0 flex-wrap items-center gap-2
  xl:justify-end`), a ordem dos elementos (alca, Marcar, Desmarcar, editar,
  arquivar/restaurar) nem os demais botões.
- Não alterar o restante do header/acordeão, DnD nem cores de fundo.
