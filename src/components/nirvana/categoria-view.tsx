import { useState } from "react";
import { Archive, ArchiveRestore, ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IndicadorCorCategoria,
  TrocarCorCategoria,
} from "./cores-categoria";
import { SubcategoriasAccordion } from "./subcategorias-accordion";
import { formatarBRL, totalCategoria } from "./types";
import type { Categoria, CorCategoria, Item, Prioridade } from "./types";

type Props = {
  categoria: Categoria;
  onVoltar: () => void;
  onArquivar?: () => void;
  onRestaurar?: () => void;
  onTrocarCor: (cor: CorCategoria) => void;
  onCriarSubcategoria: (nome: string) => void;
  onReordenarSubcategorias: (ativoId: string, sobreId: string) => void;
  onRenomearSubcategoria: (subcategoriaId: string, nome: string) => void;
  onExcluirSubcategoria: (subcategoriaId: string) => void;
  onArquivarSubcategoria?: (subcategoriaId: string) => void;
  onRestaurarSubcategoria?: (subcategoriaId: string) => void;
  onMarcarTodos: (subcategoriaId: string, concluido: boolean) => void;
  onAdicionarItem: (subcategoriaId: string, texto: string) => void;
  onAlternarItem: (subcategoriaId: string, itemId: string) => void;
  onRemoverItem: (subcategoriaId: string, itemId: string) => void;
  onDefinirPrioridade: (subcategoriaId: string, itemId: string, prioridade: Prioridade) => void;
  onTransferir: (subcategoriaId: string, item: Item) => void;
  onReordenarItens: (
    subcategoriaId: string,
    itensVisiveis: Item[],
    ativoId: string,
    sobreId: string,
  ) => void;
  onRestaurarOrdem: (subcategoriaId: string) => void;
  onAtualizarValores: (
    subcategoriaId: string,
    itemId: string,
    valores: { precoUnitario?: number; quantidade?: number },
  ) => void;
};

export function CategoriaView({
  categoria,
  onVoltar,
  onArquivar,
  onRestaurar,
  onTrocarCor,
  onCriarSubcategoria,
  onReordenarSubcategorias,
  onRenomearSubcategoria,
  onExcluirSubcategoria,
  onArquivarSubcategoria,
  onRestaurarSubcategoria,
  onMarcarTodos,
  onAdicionarItem,
  onAlternarItem,
  onRemoverItem,
  onDefinirPrioridade,
  onTransferir,
  onReordenarItens,
  onRestaurarOrdem,
  onAtualizarValores,
}: Props) {
  const modoCompras = categoria.cor === "Gold";
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState("");

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const valor = nome.trim();
    if (!valor) return;
    onCriarSubcategoria(valor);
    setNome("");
    setCriando(false);
  };

  return (
    <section className="mx-auto w-full max-w-3xl">
      <Button
        variant="ghost"
        onClick={onVoltar}
        className="-ml-3 mb-6 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Todas as categorias
      </Button>

      <div className="relative mb-8 flex justify-end gap-2">
        <TrocarCorCategoria corAtual={categoria.cor} onSelecionar={onTrocarCor} />
        {categoria.arquivada ? (
          <button
            type="button"
            aria-label="Restaurar Categoria"
            title="Restaurar Categoria"
            onClick={onRestaurar}
            className="rounded-md border border-blue-300 p-2 text-blue-600 transition-colors hover:bg-blue-50"
          >
            <ArchiveRestore className="size-5" />
          </button>
        ) : (
          <button
            type="button"
            aria-label="Arquivar Categoria"
            title="Arquivar Categoria"
            onClick={onArquivar}
            className="rounded-md border border-gray-300 p-2 text-gray-700 transition-colors hover:bg-gray-100"
          >
            <Archive className="size-5" />
          </button>
        )}
        <Button onClick={() => setCriando((v) => !v)}>
          <Plus className="size-4" />
          Nova Subcategoria
        </Button>
      </div>

      <div className="mb-8 flex flex-col items-center text-center">
        <h1 className="flex min-w-0 items-center justify-center gap-3 text-5xl font-black tracking-tight text-blue-800 sm:text-6xl">
          <IndicadorCorCategoria cor={categoria.cor} className="size-8 shrink-0" />
          <span className="truncate">{categoria.nome}</span>
          {categoria.arquivada ? (
            <span className="ml-4 rounded-full bg-gray-200 px-2 py-1 text-[10px] text-gray-600">
              ARQUIVADO
            </span>
          ) : null}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {categoria.subcategorias.length === 0
            ? "Crie uma subcategoria para começar."
            : `${categoria.subcategorias.length} subcategoria${
                categoria.subcategorias.length === 1 ? "" : "s"
              }`}
        </p>
      </div>

      {criando && (
        <form onSubmit={enviar} className="mt-6 flex gap-2">
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome da subcategoria"
            aria-label="Nome da subcategoria"
            autoFocus
            className="h-11"
          />
          <Button type="submit" size="lg" className="h-11">
            Criar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-11"
            onClick={() => {
              setCriando(false);
              setNome("");
            }}
          >
            Cancelar
          </Button>
        </form>
      )}

      <SubcategoriasAccordion
        categoria={categoria}
        modoCompras={modoCompras}
        className="mt-8"
        onReordenarSubcategorias={onReordenarSubcategorias}
        onRenomearSubcategoria={onRenomearSubcategoria}
        onExcluirSubcategoria={onExcluirSubcategoria}
        onMarcarTodos={onMarcarTodos}
        onAdicionarItem={onAdicionarItem}
        onAlternarItem={onAlternarItem}
        onRemoverItem={onRemoverItem}
        onDefinirPrioridade={onDefinirPrioridade}
        onTransferir={onTransferir}
        onReordenarItens={onReordenarItens}
        onRestaurarOrdem={onRestaurarOrdem}
        onAtualizarValores={onAtualizarValores}
      />

      {modoCompras && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-primary px-6 py-5 text-primary-foreground">
          <span className="text-xs uppercase tracking-[0.18em] text-primary-foreground/70">
            Resultado
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight tabular-nums">
            {formatarBRL(totalCategoria(categoria))}
          </span>
        </div>
      )}
    </section>
  );
}