# Plano: Botão "cor" ao lado da seta do cartão de categoria

## Objetivo
No cartão de categoria (área central), o botão atual "Trocar de cor" (azul, branco) deve:
1. Ter o texto reduzido para apenas **"cor"**.
2. Manter exatamente a mesma cor/estilo azul de hoje.
3. Sair do cluster do topo direito e ir para o canto inferior direito, **ao lado da seta (ChevronDown) que aponta para baixo**.

## Escopo
- Apenas o cartão de categoria na área central (`cartaoCategoria` em `src/routes/index.tsx`).
- Não alterar a tela de detalhe da categoria (`src/components/nirvana/categoria-view.tsx`), onde o mesmo componente `TrocarCorCategoria` é usado sem seta ao redor.
- Não mexer nos botões quadrados `[+]`/`[Arquivar]`, na alça "Mudar Posição", no DnD, nem na seta em si.

## Mudanças

### 1. `src/components/nirvana/cores-categoria.tsx`
- Adicionar uma prop opcional `rotulo?: string` (padrão `"Trocar de cor"`) em `TrocarCorCategoria`.
- O `<button>` passa a renderizar `{rotulo}` em vez do texto fixo.
- `estiloBotaoCorCategoria` (azul, borda azul, fundo branco) permanece idêntico.

### 2. `src/routes/index.tsx` — `cartaoCategoria`
- Remover `<TrocarCorCategoria>` da coluna do topo direito (onde fica acima da alça "Mudar Posição"). A alça permanece sozinha na coluna.
- Mover o `<ChevronDown>` e o `<TrocarCorCategoria rotulo="cor" .../>` para um único container absoluto no canto inferior direito:

```text
<div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
  <TrocarCorCategoria corAtual={categoria.cor}
    onSelecionar={(cor) => trocarCorCategoria(categoria.id, cor)}
    rotulo="cor" />
  <ChevronDown size={28} strokeWidth={3}
    className="pointer-events-none h-7 w-7 text-black transition-transform duration-200" />
</div>
```

- O `<ChevronDown>` atual (absolute bottom-3 right-3, `pointer-events-none`) é removido e recriado dentro deste container, mantendo os mesmos atributos visuais.
- O container fica `z-10` (igual ao cluster do topo) para que o botão "cor" receba cliques acima do `AccordionTrigger` e não dispare o acordeão.

## Resultado esperado
- Botão pequeno azul escrito **"cor"** ao lado esquerdo da seta para baixo, no canto inferior direito do cartão.
- Mesmo azul/borda/fundo de antes.
- Cluster do topo direito mantém apenas a alça "Mudar Posição" e os quadrados `[+]`/`[Arquivar]`.

## Verificação
- `bunx tsgo --noEmit` sem erros.
- Playwright: abrir a área central, confirmar botão "cor" visível ao lado da seta, cor azul, e ao clicar abrir o menu de cores; confirmar que o cluster do topo não tem mais o "Trocar de cor".
