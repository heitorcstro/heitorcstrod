import { useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { SeletorPrioridade } from "./seletor-prioridade";
import {
  formatarBRL,
  ordenarItens,
  totalItem,
  totalSubcategoria,
} from "./types";
import type { Item, Prioridade, Subcategoria } from "./types";

type Props = {
  nomeCategoria: string;
  subcategoria: Subcategoria;
  modoCompras?: boolean;
  onVoltar: () => void;
  onAdicionarItem: (texto: string) => void;
  onAlternarItem: (itemId: string) => void;
  onRemoverItem: (itemId: string) => void;
  onDefinirPrioridade: (itemId: string, prioridade: Prioridade) => void;
  onTransferir: (item: Item) => void;
  onAtualizarValores?: (
    itemId: string,
    valores: { precoUnitario?: number; quantidade?: number },
  ) => void;
};

export function ListaView({
  nomeCategoria,
  subcategoria,
  modoCompras = false,
  onVoltar,
  onAdicionarItem,
  onAlternarItem,
  onRemoverItem,
  onDefinirPrioridade,
  onTransferir,
  onAtualizarValores,
}: Props) {
  const [texto, setTexto] = useState("");
  const itensOrdenados = ordenarItens(subcategoria.itens);
  const concluidos = subcategoria.itens.filter((i) => i.concluido).length;

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
        {nomeCategoria}
      </Button>

      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
          {nomeCategoria}
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          {subcategoria.nome}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {subcategoria.itens.length === 0
            ? "Nenhum item por aqui ainda."
            : `${concluidos} de ${subcategoria.itens.length} concluídos`}
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
        {itensOrdenados.map((item) => (
          <li key={item.id} className="group py-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <SeletorPrioridade
                prioridade={item.prioridade}
                onSelecionar={(prioridade) =>
                  onDefinirPrioridade(item.id, prioridade)
                }
                onTransferir={() => onTransferir(item)}
              />
              <Checkbox
                id={item.id}
                checked={item.concluido}
                onCheckedChange={() => onAlternarItem(item.id)}
              />
              <label
                htmlFor={item.id}
                className={cn(
                  "min-w-0 flex-1 cursor-pointer text-sm leading-relaxed",
                  item.concluido && "text-muted-foreground line-through",
                )}
              >
                {item.texto}
              </label>

              {modoCompras && (
                <div className="order-last ml-9 flex flex-row items-center gap-2 sm:order-none sm:ml-0">
                  <CamposCompra
                    item={item}
                    onAtualizarValores={onAtualizarValores}
                  />
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                aria-label={`Excluir ${item.texto}`}
                onClick={() => onRemoverItem(item.id)}
                className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </li>
        ))}
        {subcategoria.itens.length === 0 && (
          <li className="py-10 text-center text-sm text-muted-foreground">
            Comece adicionando o primeiro item da lista.
          </li>
        )}
      </ul>

      {modoCompras && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-secondary px-4 py-3">
          <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Total da subcategoria
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            {formatarBRL(totalSubcategoria(subcategoria))}
          </span>
        </div>
      )}
    </section>
  );
}

function CamposCompra({
  item,
  onAtualizarValores,
}: {
  item: Item;
  onAtualizarValores:
    | ((
        itemId: string,
        valores: { precoUnitario?: number; quantidade?: number },
      ) => void)
    | undefined;
}) {
  const paraNumero = (valor: string) => {
    const n = Number(valor.replace(",", "."));
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };

  return (
    <>
      <Input
        type="number"
        min={0}
        step="0.01"
        inputMode="decimal"
        value={item.precoUnitario ?? ""}
        onChange={(e) =>
          onAtualizarValores?.(item.id, {
            precoUnitario: paraNumero(e.target.value),
          })
        }
        placeholder="Preço"
        aria-label={`Preço unitário de ${item.texto}`}
        className="h-8 w-20 px-2 text-right text-xs"
      />
      <span className="text-xs text-muted-foreground">×</span>
      <Input
        type="number"
        min={1}
        step="1"
        inputMode="numeric"
        value={item.quantidade ?? 1}
        onChange={(e) =>
          onAtualizarValores?.(item.id, {
            quantidade: Math.max(1, Math.round(paraNumero(e.target.value))),
          })
        }
        aria-label={`Quantidade de ${item.texto}`}
        className="h-8 w-14 px-2 text-right text-xs"
      />
      <span className="w-20 shrink-0 text-right text-xs font-medium tabular-nums">
        {formatarBRL(totalItem(item))}
      </span>
    </>
  );
}
