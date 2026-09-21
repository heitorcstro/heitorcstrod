import { useState } from "react";
import { ArrowLeft, Plus, ShoppingCart } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ItemOrdenavel, ListaOrdenavel } from "./dnd";
import { formatarBRL, itensExibidos, totalCategoria, totalSubcategoria } from "./types";
import type { Categoria } from "./types";

type Props = {
  categoria: Categoria;
  onVoltar: () => void;
  onAbrirSubcategoria: (subcategoriaId: string) => void;
  onCriarSubcategoria: (nome: string) => void;
  onAlternarModoCompras: () => void;
  onReordenarSubcategorias: (ativoId: string, sobreId: string) => void;
};

export function CategoriaView({
  categoria,
  onVoltar,
  onAbrirSubcategoria,
  onCriarSubcategoria,
  onAlternarModoCompras,
  onReordenarSubcategorias,
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

      <ListaOrdenavel
        id={`subcategorias-${categoria.id}`}
        ids={categoria.subcategorias.map((s) => s.id)}
        onReordenar={onReordenarSubcategorias}
      >
        <Accordion type="multiple" className="mt-8 grid gap-3 sm:grid-cols-2">
          {categoria.subcategorias.map((sub) => {
            const pendentes = sub.itens.filter((i) => !i.concluido).length;
            return (
              <ItemOrdenavel key={sub.id} id={sub.id} rotulo={sub.nome}>
                {(alca) => (
                  <AccordionItem
                    value={sub.id}
                    className="rounded-xl border border-border bg-card px-3 transition-colors hover:border-foreground/40"
                  >
                    <div className="flex items-center gap-1 [&>h3]:flex-1">
                      {alca}
                      <AccordionTrigger className="flex-1 py-5 text-left hover:no-underline [&>svg]:text-foreground">
                        <span>
                          <span className="block font-medium tracking-tight">{sub.nome}</span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {sub.itens.length === 0
                              ? "Lista vazia"
                              : `${pendentes} pendente${pendentes === 1 ? "" : "s"} · ${
                                  sub.itens.length
                                } ${sub.itens.length === 1 ? "item" : "itens"}`}
                          </span>
                          {modoCompras && (
                            <span className="mt-1 block text-xs font-medium tabular-nums">
                              {formatarBRL(totalSubcategoria(sub))}
                            </span>
                          )}
                        </span>
                      </AccordionTrigger>
                    </div>
                    <AccordionContent className="pb-5">
                      <div className="space-y-4 border-t border-border pt-4">
                        {sub.itens.length > 0 ? (
                          <ul className="space-y-2">
                            {itensExibidos(sub).map((item) => (
                              <li
                                key={item.id}
                                className="flex items-center justify-between gap-3 text-sm"
                              >
                                <span
                                  className={
                                    item.concluido
                                      ? "text-destructive no-underline"
                                      : "text-foreground"
                                  }
                                >
                                  {item.texto}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {item.prioridade ?? "—"}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Nenhum item nesta subcategoria.
                          </p>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => onAbrirSubcategoria(sub.id)}
                          className="w-full"
                        >
                          Abrir lista
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </ItemOrdenavel>
            );
          })}
          {categoria.subcategorias.length === 0 && (
            <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground sm:col-span-2">
              Nenhuma subcategoria ainda. Use “Nova Subcategoria” para criar a primeira.
            </p>
          )}
        </Accordion>
      </ListaOrdenavel>

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
