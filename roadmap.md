# Roadmap — Nirvana

## Concluído
- Divisor vertical preto full-height nos cards de categoria.
- Botão "+" (Adicionar Subcategoria) quadrado no cluster superior direito.
- Fundo dividido (colorido à esquerda, branco à direita).
- Badge "Urgente" (bookmark vermelho + contador) na categoria com "Urgente".
- Badge "Urgente" ampliado: ícone size 38, text-2xl font-black, red-600 com glow e animação heartbeat.
- Sidebar à direita + header gigante + subcategorias ampliadas (depois revertida).
- Sidebar recolhível à ESQUERDA: border-r border-black; estado isSidebarExpanded (default true); largura w-72 expandida / w-16 recolhida com transition-all duration-300 ease-in-out overflow-hidden; botão toggle (ChevronLeft/ChevronRight) no topo-direito do header (w-8 h-8 quadrado bg-white border border-black text-black rounded-md); quando recolhida, nomes, alças "M" e "+" ficam ocultos, restando apenas seta de expandir e indicadores de cor; cabeçalhos gigantes e subcategorias ampliadas preservados e aproveitam o espaço extra.

- Sidebar em overlay: <aside> virou fixed top-0 left-0 h-screen z-50 w-72 bg-white shadow-2xl transition-transform; toggle entre translate-x-0 (aberta) e -translate-x-full (fechada) via estado sidebarExpandida. Wrapper principal deixou de ser flex (relative h-screen w-full); <main> agora relative w-full h-screen (100% largura, sem squeeze). Hambúrguer Menu universal (sem md:hidden) no topo-esquerdo do header, alternando sidebarExpandida. Chevron "Recolher" interno continua fechando. Layout interno, alinhamento das alças "M" e DnD preservados.
- Espaçamento apertado na sidebar: removido justify-between do cabeçalho (Nirvana + "<" colados), dos headers PASTAS/CATEGORIAS (chevron colado ao texto com gap-1) e dos contadores das pastas (número colado ao fim do nome, sem flex-1). Slots w-5 (chevron) e w-6 (M) preservados — alças "M" continuam alinhadas em coluna reta (left=28px).
- Renomear categoria "Fazer de Maneira Urgente" -> "Urgente": atualizado em CATEGORIAS_PADRAO e via migração idempotente em normalizarCategorias (preserva id, cor, pastaId e subcategorias; só o nome muda). Badge urgente (nome contém "Urgente") continua funcionando.
- Largura mínima dinâmica da sidebar (w-fit): removida a largura fixa w-72 do <aside> overlay, agora w-fit + pr-4 (encolhe até a maior linha). Textos de nomes e headers PASTAS/CATEGORIAS/Arquivados ganharam whitespace-nowrap para não quebrar em duas linhas. Espaçamento apertado (gap-1) e alinhamento esquerdo (slots w-5 chevron + w-6 M) preservados — alças "M" permanecem em coluna reta (left=28px).
- Prioridade dos itens convertida em botão cíclico 1 → 2 → 3 → D → T → 1, com cores próprias e abertura automática da transferência em T.
- Quadrados de prioridade e conclusão removidos: toque curto no item avança a prioridade e colore a linha; pressão de 2 segundos marca ou desmarca como feito.
- Aparência branca preservada em toda a lista; somente o fundo do item muda conforme a prioridade.
- Removida a barra de progresso (BarraProgressoSubcategoria) e seu preenchimento azul; nenhum fill dinâmico nas subcategorias. Fonte do nome do item reduzida para text-[13px] (subcategorias-accordion e lista-view). Tudo branco: nenhum quadrado de marcação; apenas o próprio item muda de cor ao tocar (verde→amarelo→roxo→laranja→abre "Mover para").

- Ações em massa: "Marcar Tudo" virou "Ok"; "Desmarcar Tudo" virou quadrado branco com borda preta e "X" vermelho (sem padding). Funções onMarcarTodos e layout flex preservados.
- Minimalismo extremo do item: removidos badge de prioridade e checkbox; a extrema esquerda da linha agora começa direto no nome do item, que virou o gatilho clicável (cursor-pointer select-none, stopPropagation). A cor agora é só do TEXTO (fundo sempre branco, sem hover). Ciclo: sem prioridade (text-gray-900) → 1 (text-green-600) → 2 (text-yellow-500) → 3 (text-purple-600) → D (text-orange-500) → T (text-red-600, abre "Mover para") → volta ao sem prioridade. ItemGestos passou a envolver apenas o nome; onDefinirPrioridade aceita Prioridade | null; definirPrioridade simplificado (set direto, sem toggle).

- Removido botão "Arquivar/Restaurar" das subcategorias (mantém só "M" e Lixeira); imports/onClick limpos.
- Chevron do cartão de categoria vira botão clicável que abre/fecha (stopPropagation); aponta para cima quando aberto (ChevronUp) e para baixo quando fechado (ChevronDown). Header (AccordionTrigger) continua togglando.
- Input "Adicionar um item..." sem placeholder e com fundo branco (subcategorias-accordion e lista-view).
- Botão “cor” adicionado aos cartões centrais de Pastas, reutilizando o seletor das Categorias e atualizando dinamicamente a cor do ícone da pasta.
- Cabeçalho da subcategoria com botão “T” isolado à direita; transferência integral para uma categoria solta ou dentro de Pasta; ações em linha única na ordem Mov. Sub → Ok → X → lápis → lixeira; exclusão continua protegida por confirmação.

## Aberto
(nada)
