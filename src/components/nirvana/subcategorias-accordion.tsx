import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ItemOrdenavel, ListaOrdenavel } from "./dnd";
import { SeletorPrioridade } from "./seletor-prioridade";
import { formatarBRL, itensExibidos, totalItem, totalSubcategoria } from "./types";
import type { Categoria, Item, Prioridade } from "./types";

type Props = {
  categoria: Categoria;
  modoCompras?: boolean;
  className?: string;
  subcategoriasAbertas?: string[];
  onSubcategoriasAbertasChange?: (subcategoriasAbertas: string[]) => void;
  onReordenarSubcategorias: (ativoId: string, sobreId: string) => void;
  onRenomearSubcategoria: (subcategoriaId: string, nome: string) => void;
  onExcluirSubcategoria: (subcategoriaId: string) => void;
  onArquivarSubcategoria?: (subcategoriaId: string) => void;
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
  onAtualizarValores?: (
    subcategoriaId: string,
    itemId: string,
    valores: { precoUnitario?: number; quantidade?: number },
  ) => void;
};

const estiloLink =
  "text-xs text-slate-500 underline-offset-2 transition-colors hover:text-black hover:underline disabled:opacity-40 disabled:hover:no-underline";

const estiloBotao =
  "inline-flex shrink-0 select-none items-center rounded-md border border-black bg-white px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-black/5";

function BarraProgressoSubcategoria({
  total,
  concluidos,
}: {
  total: number;
  concluidos: number;
}) {
  const progressPercentage = total === 0 ? 0 : (concluidos / total) * 100;
  return (
    <span
      className="flex shrink-0 items-center"
      aria-label={`${concluidos} de ${total} concluídos`}
    >
      <span className="h-2.5 w-24 overflow-hidden rounded-sm border border-black bg-gray-200">
        <span
          className="block h-full bg-blue-600 transition-all duration-300 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </span>
    </span>
  );
}


export function SubcategoriasAccordion({
  categoria,
  modoCompras = false,
  className,
  subcategoriasAbertas,
  onSubcategoriasAbertasChange,
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
  const [renomeandoId, setRenomeandoId] = useState<string | null>(null);
  const [nomeEditado, setNomeEditado] = useState("");
  const [subParaExcluir, setSubParaExcluir] = useState<string | null>(null);
  const [novosItens, setNovosItens] = useState<Record<string, string>>({});

  const subExcluindo = categoria.subcategorias.find((s) => s.id === subParaExcluir) ?? null;
  const accordionControle =
    subcategoriasAbertas && onSubcategoriasAbertasChange
      ? { value: subcategoriasAbertas, onValueChange: onSubcategoriasAbertasChange }
      : {};

  const salvarRenomeacao = () => {
    if (!renomeandoId) return;
    const valor = nomeEditado.trim();
    if (valor) onRenomearSubcategoria(renomeandoId, valor);
    setRenomeandoId(null);
    setNomeEditado("");
  };

  const atualizarTextoItem = (subcategoriaId: string, texto: string) =>
    setNovosItens((atual) => ({ ...atual, [subcategoriaId]: texto }));

  const adicionarItem = (e: FormEvent, subcategoriaId: string) => {
    e.preventDefault();
    const valor = (novosItens[subcategoriaId] ?? "").trim();
    if (!valor) return;
    onAdicionarItem(subcategoriaId, valor);
    setNovosItens((atual) => ({ ...atual, [subcategoriaId]: "" }));
  };

  return (
    <>
      <ListaOrdenavel
        id={`subcategorias-${categoria.id}`}
        ids={categoria.subcategorias.map((s) => s.id)}
        onReordenar={onReordenarSubcategorias}
      >
        <Accordion
          type="multiple"
          {...accordionControle}
          className={cn("grid gap-3 border-l border-border pl-3 sm:pl-4", className)}
        >
          {categoria.subcategorias.map((sub) => {
            const pendentes = sub.itens.filter((i) => !i.concluido).length;
            const itensOrdenados = itensExibidos(sub);
            const itensAtivos = itensOrdenados.filter((item) => !item.concluido);
            const itensMarcados = itensOrdenados.filter((item) => item.concluido);
            const concluidos = sub.itens.length - pendentes;
            const renderizarItem = (item: Item) => (
              <ItemOrdenavel
                key={item.id}
                id={item.id}
                textoAlca="Mover item"
                className="group border-b border-border last:border-b-0"
              >
                {(alcaItem) => (
                  <li className="list-none py-3">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      {alcaItem}
                      <SeletorPrioridade
                        prioridade={item.prioridade}
                        onSelecionar={(prioridade) =>
                          onDefinirPrioridade(sub.id, item.id, prioridade)
                        }
                        onTransferir={() => onTransferir(sub.id, item)}
                      />
                      <Checkbox
                        id={`${sub.id}-${item.id}`}
                        checked={item.concluido}
                        onCheckedChange={() => onAlternarItem(sub.id, item.id)}
                      />
                      <label
                        htmlFor={`${sub.id}-${item.id}`}
                        className={cn(
                          "min-w-0 flex-1 cursor-pointer text-sm leading-relaxed no-underline",
                          item.concluido ? "text-red-600" : "text-foreground",
                        )}
                      >
                        {item.texto}
                      </label>

                      {modoCompras && (
                        <div className="order-last ml-9 flex w-full flex-wrap items-end gap-2 sm:order-none sm:ml-0 sm:w-auto">
                          <CamposCompra
                            item={item}
                            onAtualizarValores={(itemId, valores) =>
                              onAtualizarValores?.(sub.id, itemId, valores)
                            }
                          />
                        </div>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Excluir ${item.texto}`}
                        onClick={() => onRemoverItem(sub.id, item.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </li>
                )}
              </ItemOrdenavel>
            );

            return (
              <ItemOrdenavel key={sub.id} id={sub.id} textoAlca="Mover subcategoria" inline>
                {(alca) => (
                  <AccordionItem
                    value={sub.id}
                    className="rounded-xl border border-border bg-card px-3 transition-colors hover:border-foreground/40"
                  >
                    <div className="flex flex-col gap-2 py-2 xl:flex-row xl:items-center">
                      <AccordionTrigger className="min-w-0 flex-1 py-3 text-left hover:no-underline [&>svg]:text-foreground">
                        <span className="flex min-w-0 flex-1 flex-col gap-1">
                          {renomeandoId === sub.id ? (
                            <span className="text-sm text-muted-foreground">Renomeando…</span>
                          ) : (
                            <span className="flex min-w-0 flex-row items-center gap-3">
                              <span className="truncate font-medium tracking-tight">{sub.nome}</span>
                              <BarraProgressoSubcategoria
                                total={sub.itens.length}
                                concluidos={concluidos}
                              />
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {sub.itens.length === 0
                              ? "Lista vazia"
                              : `${pendentes} pendente${pendentes === 1 ? "" : "s"} · ${
                                  sub.itens.length
                                } ${sub.itens.length === 1 ? "item" : "itens"}`}
                          </span>
                          {modoCompras && (
                            <span className="block text-xs font-medium tabular-nums">
                              {formatarBRL(totalSubcategoria(sub))}
                            </span>
                          )}
                        </span>
                      </AccordionTrigger>

                      <div className="flex min-w-0 flex-wrap items-center gap-2 xl:justify-end">
                        {alca}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button type="button" className={estiloBotao}>
                              Editar Subcategoria
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() => {
                                setRenomeandoId(sub.id);
                                setNomeEditado(sub.nome);
                              }}
                            >
                              Renomear
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onSelect={() => setSubParaExcluir(sub.id)}
                            >
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <button
                          type="button"
                          className={estiloLink}
                          disabled={sub.itens.length === 0}
                          onClick={() => onMarcarTodos(sub.id, true)}
                        >
                          Marcar Tudo
                        </button>
                        <button
                          type="button"
                          className={estiloLink}
                          disabled={sub.itens.length === 0}
                          onClick={() => onMarcarTodos(sub.id, false)}
                        >
                          Desmarcar Tudo
                        </button>
                      </div>
                    </div>

                    {renomeandoId === sub.id && (
                      <div className="pb-3">
                        <Input
                          autoFocus
                          value={nomeEditado}
                          onChange={(e) => setNomeEditado(e.target.value)}
                          onBlur={salvarRenomeacao}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              salvarRenomeacao();
                            }
                            if (e.key === "Escape") {
                              setRenomeandoId(null);
                              setNomeEditado("");
                            }
                          }}
                          aria-label="Novo nome da subcategoria"
                          className="h-10"
                        />
                      </div>
                    )}

                    <AccordionContent className="pb-5">
                      <div className="space-y-4 border-t border-border pt-4">
                        <form onSubmit={(e) => adicionarItem(e, sub.id)} className="flex gap-2">
                          <Input
                            value={novosItens[sub.id] ?? ""}
                            onChange={(e) => atualizarTextoItem(sub.id, e.target.value)}
                            placeholder="Adicionar um item..."
                            aria-label={`Novo item em ${sub.nome}`}
                            className="h-11"
                          />
                          <Button type="submit" size="lg" className="h-11 px-4">
                            <Plus className="size-4" />
                            <span className="sr-only sm:not-sr-only">Adicionar</span>
                          </Button>
                        </form>

                        {sub.ordemManual && (
                          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-secondary px-3 py-2">
                            <span className="text-xs text-muted-foreground">
                              Ordem manual ativa (arrastada por você).
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => onRestaurarOrdem(sub.id)}
                            >
                              Ordenar por prioridade
                            </Button>
                          </div>
                        )}

                        <ListaOrdenavel
                          id={`itens-inline-${sub.id}`}
                          ids={itensAtivos.map((i) => i.id)}
                          onReordenar={(ativoId, sobreId) =>
                            onReordenarItens(sub.id, itensOrdenados, ativoId, sobreId)
                          }
                        >
                          <ul className="divide-y divide-border border-y border-border">
                            {itensAtivos.map(renderizarItem)}
                            {sub.itens.length === 0 && (
                              <li className="py-10 text-center text-sm text-muted-foreground">
                                Comece adicionando o primeiro item da lista.
                              </li>
                            )}
                            {sub.itens.length > 0 && itensAtivos.length === 0 && (
                              <li className="py-8 text-center text-sm text-muted-foreground">
                                Nenhum item ativo.
                              </li>
                            )}
                          </ul>
                        </ListaOrdenavel>

                        {itensMarcados.length > 0 && (
                          <section className="border-t border-border pt-4">
                            <div className="mb-3 flex items-center gap-3">
                              <h4 className="shrink-0 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                Marcados
                              </h4>
                              <span className="h-px flex-1 bg-border" />
                            </div>
                            <ListaOrdenavel
                              id={`itens-marcados-inline-${sub.id}`}
                              ids={itensMarcados.map((i) => i.id)}
                              onReordenar={(ativoId, sobreId) =>
                                onReordenarItens(sub.id, itensOrdenados, ativoId, sobreId)
                              }
                            >
                              <ul className="divide-y divide-border border-y border-border bg-secondary/40">
                                {itensMarcados.map(renderizarItem)}
                              </ul>
                            </ListaOrdenavel>
                          </section>
                        )}

                        {modoCompras && (
                          <div className="flex items-center justify-between rounded-xl border border-border bg-secondary px-4 py-3">
                            <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                              Total da subcategoria
                            </span>
                            <span className="font-display text-lg font-semibold tracking-tight">
                              {formatarBRL(totalSubcategoria(sub))}
                            </span>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </ItemOrdenavel>
            );
          })}
          {categoria.subcategorias.length === 0 && (
            <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              Nenhuma subcategoria ainda. Use “Nova Subcategoria” para criar a primeira.
            </p>
          )}
        </Accordion>
      </ListaOrdenavel>

      <AlertDialog
        open={subParaExcluir !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setSubParaExcluir(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Tem certeza que deseja excluir esta subcategoria e todos os itens dentro dela?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {subExcluindo
                ? `A subcategoria “${subExcluindo.nome}” será removida permanentemente.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                if (subParaExcluir) onExcluirSubcategoria(subParaExcluir);
                setSubParaExcluir(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function CamposCompra({
  item,
  onAtualizarValores,
}: {
  item: Item;
  onAtualizarValores:
    | ((itemId: string, valores: { precoUnitario?: number; quantidade?: number }) => void)
    | undefined;
}) {
  const paraNumero = (valor: string) => {
    const n = Number(valor.replace(",", "."));
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };

  return (
    <>
      <label className="flex w-28 flex-col gap-1 text-[11px] font-medium text-muted-foreground">
        Valor por Item
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
          placeholder="0,00"
          aria-label={`Valor por Item de ${item.texto}`}
          className="h-8 px-2 text-right text-xs text-foreground"
        />
      </label>
      <label className="flex w-28 flex-col gap-1 text-[11px] font-medium text-muted-foreground">
        Número de Itens
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
          aria-label={`Número de Itens de ${item.texto}`}
          className="h-8 px-2 text-right text-xs text-foreground"
        />
      </label>
      <span className="flex w-28 flex-col gap-1 text-[11px] font-medium text-muted-foreground">
        Total do Item
        <span className="flex h-8 items-center justify-end rounded-md border border-border bg-secondary px-2 text-xs font-semibold tabular-nums text-foreground">
          {formatarBRL(totalItem(item))}
        </span>
      </span>
    </>
  );
}