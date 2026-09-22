# Plano: Renomear pasta "Levar de Manhã" → "Manhã" + alinhar nº/setinha/M colados depois do nome

## 1) Renomear a pasta existente (migração única)
Em `src/components/nirvana/types.ts`, `normalizarPastas` (linha ~152): no `.map`, se `p.nome === "Levar de Manhã"`, trocar para `"Manhã"`.
- Idempotente: roda a cada carregamento, mas só renomeia enquanto existir uma pasta com o nome antigo. Aplica-se ao estado único de `pastas`, então vale para sidebar e área central.
- Só pastas; categorias não são tocadas.

## 2) Layout: número, setinha e "M" colados logo após o nome (sidebar + central)
Hoje o nome usa `flex-1` e a alça "M" (sidebar) tem `ml-auto`, empurrando nº/setinha/M para a borda direita — gerando espaços vazios. Mudar para que esses controles fiquem **colados logo depois do nome**, seguindo o comprimento do nome (sem espaço vazio).

### Sidebar — `src/components/nirvana/sidebar-categorias.tsx` (~linhas 308-350)
- No `<button>` do nome: remover `flex-1` (manter `min-w-0 whitespace-normal break-words text-left text-sm font-medium`).
- No `<ItemOrdenavel>` da pasta: manter `alcaLetra="M"`, mas adicionar `alcaClassName` com a mesma aparência do quadrado "M" **sem** `ml-auto`:
  `inline-flex size-8 shrink-0 cursor-grab touch-none select-none items-center justify-center rounded-md border border-black bg-white p-0 text-sm font-medium text-black transition-colors hover:bg-black/5 active:cursor-grabbing`
- Resultado da linha: `[ícone] [nome] [nº] [setinha] [M]` tudo encostado à esquerda, sem espaço à direita.

### Área central — `src/routes/index.tsx` (~linhas 1141-1152)
- No `<button>` do nome: trocar `min-w-0 flex-1 text-left` por `min-w-0 text-left` (remove `flex-1`).
- A alça já usa `alcaTexto="Mudar Posição"` com `alcaClassName` próprio (sem `ml-auto`), então já fica colada após a setinha; só precisava remover o `flex-1` do nome.
- Resultado: `[ícone] [nome + "N categorias"] [setinha] [Mudar Posição]` colados à esquerda.

## Escopo / preservação
- Apenas a seção **Pastas** (sidebar + central). Categorias, DnD, modais, cores e demais estilos não mudam.
- O "M"/"Mudar Posição" continua sendo a alça de arraste (listeners/attributes do dnd-kit intactos); só muda o espaçamento.

## Verificação
- `bunx tsgo --noEmit` sem erros.
- Playwright (`http://localhost:8080`): semear no localStorage uma pasta "Levar de Manhã" e outra "Fazer-" via `localStorage.setItem("nirvana:pastas:v1", ...)`, recarregar e confirmar:
  - a pasta "Levar de Manhã" passou a se chamar "Manhã";
  - nº, setinha e "M"/"Mudar Posição" ficam colados logo após o nome, sem espaço vazio à direita, em sidebar e central;
  - sem erros de console.
