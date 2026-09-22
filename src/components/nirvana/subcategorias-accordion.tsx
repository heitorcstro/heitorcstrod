import { useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ArchiveRestore } from "lucide-react";
import { BotaoArquivar } from "./botao-arquivar";
import { ItemOrdenavel, ListaOrdenavel } from "./dnd";
import { ItemGestos } from "./item-gestos";
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
  onArquivarSubcategoria?: ((subcategoriaId: string) => void) | undefined;
  onRestaurarSubcategoria?: ((subcategoriaId: string) => void) | undefined;
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

const estiloBaseAcao =
  "inline-flex shrink-0 select-none items-center rounded-md border border-black bg-white px-2 py-1 text-xs font-medium whitespace-nowrap transition-colors hover:bg-black/5 disabled:opacity-40 disabled:hover:bg-transparent";

export function SubcategoriasAccordion({
  categoria,
  modoCompras = false,
  className,
  subcategoriasAbertas,
  onSubcategoriasAbertasChange,
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
  const [renomeandoId, setRenomeandoId] = useState<string | null>(null);
  const [nomeEditado, setNomeEditado] = useState("");
  const [subParaExcluir, setSubParaExcluir] = useState<string | null>(null);
  const [novosItens, setNovosItens] = useState<Record<string, string>>({});

  // Arquivar é apenas um status: a subcategoria continua visível na categoria.
  const subcategoriasVisiveis = categoria.subcategorias;
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
        ids={subcategoriasVisiveis.map((s) => s.id)}
        onReordenar={onReordenarSubcategorias}
      >
        <Accordion
          type="multiple"
          {...accordionControle}
          className={cn(
            "grid w-full max-w-full grid-cols-1 gap-3 border-l border-border pl-3 pr-4 sm:pl-4",
            className,
          )}
        >
          {subcategoriasVisiveis.map((sub) => {
            const pendentes = sub.itens.filter((i) => !i.concluido).length;
            const itensOrdenados = itensExibidos(sub);
            const itensAtivos = itensOrdenados.filter((item) => !item.concluido);
            const itensMarcados = itensOrdenados.filter((item) => item.concluido);
            const renderizarItem = (item: Item) => (
              <ItemOrdenavel
                key={item.id}
                id={item.id}
                textoAlca="Mover item"
                inline
                alcaLetra="M"
                className="group border-b border-border last:border-b-0"
              >
                {(alcaItem) => (
                  <li className="list-none py-3">
                    <ItemGestos
                      item={item}
                      onDefinirPrioridade={(prioridade) =>
                        onDefinirPrioridade(sub.id, item.id, prioridade)
                      }
                      onTransferir={() => onTransferir(sub.id, item)}
                      onAlternarConclusao={() => onAlternarItem(sub.id, item.id)}
                      className="group flex w-full max-w-full flex-col border-b border-border p-1"
                    >
                      {/* LINHA DE CIMA: dados e info principal */}
                      <div className="flex w-full min-w-0 flex-wrap items-center">
                        <span className="min-w-0 flex-1 truncate text-[13px] leading-relaxed no-underline">
                          {item.texto}
                        </span>

                        {modoCompras && (
                          <div
                            className="flex w-full flex-wrap items-end gap-2 sm:ml-2 sm:w-auto"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <CamposCompra
                              item={item}
                              onAtualizarValores={(itemId, valores) =>
                                onAtualizarValores?.(sub.id, itemId, valores)
                              }
                            />
                          </div>
                        )}
                      </div>

                      {/* LINHA DE BAIXO: alça "M" e Lixeira */}
                      <div
                        className="mt-1 flex w-full items-center justify-end gap-1 pt-1"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {alcaItem}
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Excluir ${item.texto}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoverItem(sub.id, item.id);
                          }}
                          className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </ItemGestos>
                  </li>
                )}
              </ItemOrdenavel>
            );


            return (
              <ItemOrdenavel
                key={sub.id}
                id={sub.id}
                textoAlca="Mover subcategoria"
                inline
                alcaClassName={`${estiloBaseAcao} cursor-grab touch-none text-black active:cursor-grabbing`}
              >
                {(alca) => (
                  <AccordionItem
                    value={sub.id}
                    className={cn(
                      "w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-border px-6 transition-colors hover:border-foreground/40",
                      sub.arquivada ? "bg-gray-100 opacity-60" : "bg-card",
                    )}
                  >
                     <div className="flex w-full min-w-0 max-w-full flex-col gap-3 py-4 xl:flex-row xl:items-center">
                       {renomeandoId === sub.id ? (
                         <div
                           className="min-w-0 flex-1 py-2"
                           onClick={(e) => e.stopPropagation()}
                         >
                           <Input
                             autoFocus
                             value={nomeEditado}
                             onClick={(e) => e.stopPropagation()}
                             onChange={(e) => setNomeEditado(e.target.value)}
                             onBlur={salvarRenomeacao}
                             onKeyDown={(e) => {
                               e.stopPropagation();
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
                             className="h-10 text-lg font-bold"
                           />
                         </div>
                       ) : (
                         <AccordionTrigger className="min-w-0 flex-1 py-4 text-left hover:no-underline [&>svg]:text-foreground">
                        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                            <span className="flex min-w-0 flex-row items-center gap-3">
                              <span className="truncate text-2xl font-bold tracking-tight">{sub.nome}</span>
                              {sub.arquivada ? (
                                <span className="shrink-0 rounded-full bg-gray-200 px-2 py-1 text-[10px] text-gray-600">
                                  ARQUIVADO
                                </span>
                              ) : null}
                            </span>
                          <span className="text-sm text-muted-foreground">
                            {sub.itens.length === 0
                              ? "Lista vazia"
                              : `${pendentes} pendente${pendentes === 1 ? "" : "s"} · ${
                                  sub.itens.length
                                } ${sub.itens.length === 1 ? "item" : "itens"}`}
                          </span>
                          {modoCompras && (
                            <span className="block text-sm font-medium tabular-nums">
                              {formatarBRL(totalSubcategoria(sub))}
                            </span>
                          )}
                        </span>
                      </AccordionTrigger>
                       )}

                      <div className="flex min-w-0 flex-wrap items-center gap-2 xl:justify-end">
                        {alca}
                        <button
                          type="button"
                          className={`${estiloBaseAcao} text-green-700 font-bold`}
                          disabled={sub.itens.length === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarcarTodos(sub.id, true);
                          }}
                        >
                          Ok
                        </button>
                        <button
                          type="button"
                          aria-label="Desmarcar tudo"
                          title="Desmarcar tudo"
                          className="inline-flex shrink-0 select-none items-center justify-center rounded-md border border-black bg-white p-0 transition-colors hover:bg-black/5 disabled:opacity-40 disabled:hover:bg-transparent"
                          disabled={sub.itens.length === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarcarTodos(sub.id, false);
                          }}
                        >
                          <div className="flex size-5 shrink-0 items-center justify-center rounded-sm border border-black bg-white">
                            <span className="text-sm font-bold leading-none text-red-500">X</span>
                          </div>
                        </button>

                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            aria-label={`Renomear ${sub.nome}`}
                            title="Renomear"
                            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-black bg-white text-black transition-colors hover:bg-black/5"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenomeandoId(sub.id);
                              setNomeEditado(sub.nome);
                            }}
                          >
                            <Pencil className="size-4" />
                          </button>
                          {sub.arquivada
                            ? onRestaurarSubcategoria && (
                                <button
                                  type="button"
                                  aria-label={`Restaurar ${sub.nome}`}
                                  title="Restaurar"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRestaurarSubcategoria(sub.id);
                                  }}
                                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-blue-300 bg-white text-blue-600 transition-colors hover:bg-blue-50"
                                >
                                  <ArchiveRestore className="size-4" />
                                </button>
                              )
                            : onArquivarSubcategoria && (
                                <BotaoArquivar
                                  rotulo={`Arquivar ${sub.nome}`}
                                  onArquivar={() => onArquivarSubcategoria(sub.id)}
                                />
                              )}
                          <button
                            type="button"
                            aria-label={`Excluir ${sub.nome}`}
                            title="Excluir"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSubParaExcluir(sub.id);
                            }}
                            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-red-300 bg-white text-red-600 transition-colors hover:bg-red-50"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    </div>


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
                              <ul className="divide-y divide-border border-y border-border bg-white">
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
          {subcategoriasVisiveis.length === 0 && (
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