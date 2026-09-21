import { useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Categoria } from "./types";

type Props = {
  categoria: Categoria;
  onVoltar: () => void;
  onAdicionarItem: (texto: string) => void;
  onAlternarItem: (itemId: string) => void;
  onRemoverItem: (itemId: string) => void;
};

export function ListaView({
  categoria,
  onVoltar,
  onAdicionarItem,
  onAlternarItem,
  onRemoverItem,
}: Props) {
  const [texto, setTexto] = useState("");
  const concluidos = categoria.itens.filter((i) => i.concluido).length;

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const valor = texto.trim();
    if (!valor) return;
    onAdicionarItem(valor);
    setTexto("");
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

      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {categoria.nome}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {categoria.itens.length === 0
            ? "Nenhum item por aqui ainda."
            : `${concluidos} de ${categoria.itens.length} concluídos`}
        </p>
      </header>

      <form onSubmit={enviar} className="flex gap-2">
        <Input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Adicionar um item..."
          aria-label="Novo item"
          className="h-11"
        />
        <Button type="submit" size="lg" className="h-11 px-4">
          <Plus className="size-4" />
          <span className="sr-only sm:not-sr-only">Adicionar</span>
        </Button>
      </form>

      <ul className="mt-6 divide-y divide-border border-y border-border">
        {categoria.itens.map((item) => (
          <li key={item.id} className="group flex items-center gap-3 py-3">
            <Checkbox
              id={item.id}
              checked={item.concluido}
              onCheckedChange={() => onAlternarItem(item.id)}
            />
            <label
              htmlFor={item.id}
              className={cn(
                "flex-1 cursor-pointer text-sm leading-relaxed",
                item.concluido && "text-muted-foreground line-through",
              )}
            >
              {item.texto}
            </label>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Excluir ${item.texto}`}
              onClick={() => onRemoverItem(item.id)}
              className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
            >
              <Trash2 className="size-4" />
            </Button>
          </li>
        ))}
        {categoria.itens.length === 0 && (
          <li className="py-10 text-center text-sm text-muted-foreground">
            Comece adicionando o primeiro item da lista.
          </li>
        )}
      </ul>
    </section>
  );
}
