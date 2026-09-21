import { useState } from "react";
import { ArrowLeft, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubcategoriasAccordion } from "./subcategorias-accordion";
import { formatarBRL, totalCategoria } from "./types";
import type { Categoria, Item, Prioridade } from "./types";

type Props = {
  categoria: Categoria;
  onVoltar: () => void;
  onCriarSubcategoria: (nome: string) => void;
  onAlternarModoCompras: () => void;
  onReordenarSubcategorias: (ativoId: string, sobreId: string) => void;
  onRenomearSubcategoria: (subcategoriaId: string, nome: string) => void;
  onExcluirSubcategoria: (subcategoriaId: string) => void;
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
  onCriarSubcategoria,
  onAlternarModoCompras,
  onReordenarSubcategorias,
  onRenomearSubcategoria,
  onExcluirSubcategoria,
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
  const modoCompras = categoria.isShoppingList === true;
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
    <section className="mx-auto w-full max-w-2xl">
      <Button
        variant="ghost"
        onClick={onVoltar}
        className="-ml-3 mb-6 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Todas as categorias
      </Button>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{categoria.nome}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {categoria.subcategorias.length === 0
              ? "Crie uma subcategoria para começar."
              : `${categoria.subcategorias.length} subcategoria${
                  categoria.subcategorias.length === 1 ? "" : "s"
                }`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={onAlternarModoCompras}>
            <ShoppingCart className="size-4" />
            {modoCompras ? "Desativar compras" : "Lista de Compras"}
          </Button>
          <Button onClick={() => setCriando((v) => !v)}>
            <Plus className="size-4" />
            Nova Subcategoria
          </Button>
        </div>
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
            Valor Total da Categoria
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight tabular-nums">
            {formatarBRL(totalCategoria(categoria))}
          </span>
        </div>
      )}
    </section>
  );
}