# Roadmap

## Concluído
- Divisor vertical preto nos cards de categoria: span full-height (top-to-bottom), aplicado estritamente a categorias (não a subcategorias). Texto ancorado à esquerda, botões à direita e seta bottom-right preservados.
- Botão "Adicionar Subcategoria" no cluster superior direito de cada categoria. Ordem estrita [Adicionar Subcategoria] → [Mover categoria] → [Trocar de cor]. Estilo branco (bg-white border border-black text-black px-3 py-1.5 rounded-md text-sm font-medium). Abre modal com input para nomear; confirma cria a subcategoria e abre a categoria. Zero outras mudanças.
- Cluster com flex-wrap para evitar sobrepor o título; título max-w-[40%], cluster max-w-[58%].

## Aberto
(nenhum)
1. Split background (colored left / white right) on category cards
2. Chevron -> black (visible on white right side)
3. Keep buttons exact top-right positions; cluster wraps only on 2-col (lg) to avoid covering title
