# Subcategoria: fonte menor e sem branco sobre o laranja

## O que muda

1. **Nome da subcategoria menor**
   O nome fica bem menor e mais compacto (de tamanho grande para um tamanho pequeno), junto com a linha de contagem ("X pendentes · Y itens") logo abaixo, que também diminui.

2. **A caixa branca não invade mais a cor da categoria**
   Hoje a caixa da subcategoria tem fundo branco sólido, então ao abrir ela cobre o laranja da categoria. Passa a ter fundo transparente: a cor da categoria aparece por baixo, ficando apenas a moldura fina da caixa para delimitar. O mesmo vale para a lista interna de itens e para o bloco "Marcados", que hoje também têm branco fixo.
   Subcategoria arquivada continua com o cinza claro de sempre, para seguir identificável.

## Detalhes técnicos

Arquivo: `src/components/nirvana/subcategorias-accordion.tsx`

- Nome: `text-2xl font-bold` → `text-sm font-semibold`; linha de resumo `text-sm` → `text-[11px]`; valor do modo compras idem.
- `AccordionItem`: troca `bg-card` por `bg-transparent` (mantém `bg-gray-100 opacity-60` quando arquivada) e mantém `overflow-hidden`/`max-w-full`.
- `ul` dos itens marcados: remove `bg-white`.
- Sem mudanças em lógica, gestos de prioridade, arraste ou arquivamento.
