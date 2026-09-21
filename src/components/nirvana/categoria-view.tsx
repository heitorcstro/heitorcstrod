import { useState } from "react";
import { ArrowLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Categoria } from "./types";

type Props = {
  categoria: Categoria;
  onVoltar: () => void;
  onAbrirSubcategoria: (subcategoriaId: string) => void;
  onCriarSubcategoria: (nome: string) => void;
};

export function CategoriaView({
  categoria,
  onVoltar,
  onAbrirSubcategoria,
  onCriarSubcategoria,
}: Props) {
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
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {categoria.nome}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {categoria.subcategorias.length === 0
              ? "Crie uma subcategoria para começar."
              : `${categoria.subcategorias.length} subcategoria${
                  categoria.subcategorias.length === 1 ? "" : "s"
                }`}
          </p>
        </div>
        <Button onClick={() => setCriando((v) => !v)}>
          <Plus className="size-4" />
          Nova Subcategoria
        </Button>
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

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {categoria.subcategorias.map((sub) => {
          const pendentes = sub.itens.filter((i) => !i.concluido).length;
          return (
            <button
              key={sub.id}
              onClick={() => onAbrirSubcategoria(sub.id)}
              className="group flex items-center justify-between rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-foreground/40 hover:bg-secondary"
            >
              <span>
                <span className="block font-medium tracking-tight">
                  {sub.nome}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {sub.itens.length === 0
                    ? "Lista vazia"
                    : `${pendentes} pendente${pendentes === 1 ? "" : "s"} · ${
                        sub.itens.length
                      } ${sub.itens.length === 1 ? "item" : "itens"}`}
                </span>
              </span>
              <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </button>
          );
        })}
        {categoria.subcategorias.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground sm:col-span-2">
            Nenhuma subcategoria ainda. Use “Nova Subcategoria” para criar a
            primeira.
          </p>
        )}
      </div>
    </section>
  );
}
