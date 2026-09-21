import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ListChecks, Plus, Trash2 } from "lucide-react";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ListaView } from "@/components/nirvana/lista-view";
import { CategoriaView } from "@/components/nirvana/categoria-view";
import { DialogoTransferir } from "@/components/nirvana/dialogo-transferir";
import { ItemOrdenavel, ListaOrdenavel } from "@/components/nirvana/dnd";
import {
  categoriasIniciais,
  contarItens,
  contarPendentes,
  criarId,
  itensExibidos,
  moverPorId,
  type Categoria,
  type Item,
  type Prioridade,
  type Subcategoria,
} from "@/components/nirvana/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nirvana — Suas listas organizadas" },
      {
        name: "description",
        content:
          "Nirvana é um aplicativo minimalista de listas com categorias, subcategorias e prioridades para organizar tarefas, compras e viagens.",
      },
      { property: "og:title", content: "Nirvana — Suas listas organizadas" },
      {
        property: "og:description",
        content:
          "Organize tarefas diárias, compras e viagens em categorias, subcategorias e prioridades.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NirvanaPage,
});

const CHAVE = "nirvana:categorias:v2";

function NirvanaPage() {
  const [categorias, setCategorias] = useState<Categoria[]>(categoriasIniciais);
  const [categoriaAtivaId, setCategoriaAtivaId] = useState<string | null>(null);
  const [subcategoriaAtivaId, setSubcategoriaAtivaId] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalDeletarAberto, setModalDeletarAberto] = useState(false);
  const [categoriaParaExcluir, setCategoriaParaExcluir] = useState<Categoria | null>(null);
  const [novoNome, setNovoNome] = useState("");
  const [carregado, setCarregado] = useState(false);
  const [itemTransferindo, setItemTransferindo] = useState<{
    item: Item;
    subcategoriaId: string;
  } | null>(null);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE);
      if (salvo) setCategorias(JSON.parse(salvo) as Categoria[]);
    } catch {
      /* ignora dados inválidos */
    }
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!carregado) return;
    localStorage.setItem(CHAVE, JSON.stringify(categorias));
  }, [categorias, carregado]);

  const categoriaAtiva = categorias.find((c) => c.id === categoriaAtivaId) ?? null;
  const subcategoriaAtiva =
    categoriaAtiva?.subcategorias.find((s) => s.id === subcategoriaAtivaId) ?? null;

  const atualizarSubcategoria = (subcategoriaId: string, fn: (itens: Item[]) => Item[]) =>
    setCategorias((atual) =>
      atual.map((c) => ({
        ...c,
        subcategorias: c.subcategorias.map((s) =>
          s.id === subcategoriaId ? { ...s, itens: fn(s.itens) } : s,
        ),
      })),
    );

  const patchSubcategoria = (subcategoriaId: string, fn: (sub: Subcategoria) => Subcategoria) =>
    setCategorias((atual) =>
      atual.map((c) => ({
        ...c,
        subcategorias: c.subcategorias.map((s) => (s.id === subcategoriaId ? fn(s) : s)),
      })),
    );

  // ===== Reordenação por arrastar-e-soltar =====
  const reordenarCategorias = (ativoId: string, sobreId: string) =>
    setCategorias((atual) => moverPorId(atual, ativoId, sobreId));

  const reordenarSubcategorias = (categoriaId: string, ativoId: string, sobreId: string) =>
    setCategorias((atual) =>
      atual.map((c) =>
        c.id === categoriaId
          ? {
              ...c,
              subcategorias: moverPorId(c.subcategorias, ativoId, sobreId),
            }
          : c,
      ),
    );

  // A ordem manual passa a valer sobre a ordenação automática por prioridade.
  const reordenarItens = (
    subcategoriaId: string,
    itensVisiveis: Item[],
    ativoId: string,
    sobreId: string,
  ) =>
    patchSubcategoria(subcategoriaId, (sub) => ({
      ...sub,
      itens: moverPorId(itensVisiveis, ativoId, sobreId),
      ordemManual: true,
    }));

  const restaurarOrdemAutomatica = (subcategoriaId: string) =>
    patchSubcategoria(subcategoriaId, (sub) => ({
      ...sub,
      ordemManual: false,
    }));

  const criarCategoria = (e: React.FormEvent) => {
    e.preventDefault();
    const nome = novoNome.trim();
    if (!nome) return;
    setCategorias((atual) => [...atual, { id: criarId(), nome, subcategorias: [] }]);
    setNovoNome("");
    setModalAberto(false);
  };

  const excluirCategoria = (categoriaId: string) => {
    setCategorias((atual) => atual.filter((c) => c.id !== categoriaId));
    if (categoriaAtivaId === categoriaId) {
      setCategoriaAtivaId(null);
      setSubcategoriaAtivaId(null);
    }
    setCategoriaParaExcluir(null);
    setModalDeletarAberto(false);
  };

  const criarSubcategoria = (categoriaId: string, nome: string) =>
    setCategorias((atual) =>
      atual.map((c) =>
        c.id === categoriaId
          ? {
              ...c,
              subcategorias: [...c.subcategorias, { id: criarId(), nome, itens: [] }],
            }
          : c,
      ),
    );

  // Marca/desmarca apenas os itens desta subcategoria e volta à ordenação automática.
  const marcarTodosItens = (subcategoriaId: string, concluido: boolean) =>
    patchSubcategoria(subcategoriaId, (sub) => ({
      ...sub,
      ordemManual: false,
      itens: sub.itens.map((i) => ({ ...i, concluido })),
    }));

  const renomearSubcategoria = (subcategoriaId: string, nome: string) =>
    patchSubcategoria(subcategoriaId, (sub) => ({ ...sub, nome }));

  const excluirSubcategoria = (subcategoriaId: string) => {
    setCategorias((atual) =>
      atual.map((c) => ({
        ...c,
        subcategorias: c.subcategorias.filter((s) => s.id !== subcategoriaId),
      })),
    );
    if (subcategoriaAtivaId === subcategoriaId) setSubcategoriaAtivaId(null);
  };

  const alternarModoCompras = (categoriaId: string) =>
    setCategorias((atual) =>
      atual.map((c) => (c.id === categoriaId ? { ...c, isShoppingList: !c.isShoppingList } : c)),
    );

  const transferirItem = (destinoId: string) => {
    if (!itemTransferindo) return;
    const { item, subcategoriaId } = itemTransferindo;
    setCategorias((atual) =>
      atual.map((c) => ({
        ...c,
        subcategorias: c.subcategorias.map((s) => {
          if (s.id === subcategoriaId)
            return { ...s, itens: s.itens.filter((i) => i.id !== item.id) };
          if (s.id === destinoId) return { ...s, itens: [...s.itens, item] };
          return s;
        }),
      })),
    );
    setItemTransferindo(null);
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <button
            type="button"
            onClick={() => {
              setCategoriaAtivaId(null);
              setSubcategoriaAtivaId(null);
            }}
            className="flex items-center gap-2.5"
          >
            <ListChecks className="size-5" />
            <span className="font-display text-lg font-semibold tracking-tight">Nirvana</span>
          </button>
          <span className="text-xs uppercase tracking-[0.18em] text-primary-foreground/60">
            Suas listas
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        {categoriaAtiva && subcategoriaAtiva ? (
          <ListaView
            nomeCategoria={categoriaAtiva.nome}
            subcategoria={subcategoriaAtiva}
            modoCompras={categoriaAtiva.isShoppingList === true}
            onVoltar={() => setSubcategoriaAtivaId(null)}
            onAdicionarItem={(texto) =>
              atualizarSubcategoria(subcategoriaAtiva.id, (itens) => [
                ...itens,
                {
                  id: criarId(),
                  texto,
                  concluido: false,
                  prioridade: null,
                  precoUnitario: 0,
                  quantidade: 1,
                },
              ])
            }
            onAlternarItem={(itemId) =>
              atualizarSubcategoria(subcategoriaAtiva.id, (itens) =>
                itens.map((i) => (i.id === itemId ? { ...i, concluido: !i.concluido } : i)),
              )
            }
            onRemoverItem={(itemId) =>
              atualizarSubcategoria(subcategoriaAtiva.id, (itens) =>
                itens.filter((i) => i.id !== itemId),
              )
            }
            onDefinirPrioridade={(itemId, prioridade: Prioridade) =>
              atualizarSubcategoria(subcategoriaAtiva.id, (itens) =>
                itens.map((i) =>
                  i.id === itemId
                    ? {
                        ...i,
                        prioridade: i.prioridade === prioridade ? null : prioridade,
                      }
                    : i,
                ),
              )
            }
            onTransferir={(item) =>
              setItemTransferindo({ item, subcategoriaId: subcategoriaAtiva.id })
            }
            onReordenarItens={(ativoId, sobreId) =>
              reordenarItens(
                subcategoriaAtiva.id,
                itensExibidos(subcategoriaAtiva),
                ativoId,
                sobreId,
              )
            }
            onRestaurarOrdem={() => restaurarOrdemAutomatica(subcategoriaAtiva.id)}
            onAtualizarValores={(itemId, valores) =>
              atualizarSubcategoria(subcategoriaAtiva.id, (itens) =>
                itens.map((i) => (i.id === itemId ? { ...i, ...valores } : i)),
              )
            }
          />
        ) : categoriaAtiva ? (
          <CategoriaView
            categoria={categoriaAtiva}
            onVoltar={() => setCategoriaAtivaId(null)}
            onAbrirSubcategoria={(id) => setSubcategoriaAtivaId(id)}
            onCriarSubcategoria={(nome) => criarSubcategoria(categoriaAtiva.id, nome)}
            onAlternarModoCompras={() => alternarModoCompras(categoriaAtiva.id)}
            onReordenarSubcategorias={(ativoId, sobreId) =>
              reordenarSubcategorias(categoriaAtiva.id, ativoId, sobreId)
            }
            onRenomearSubcategoria={renomearSubcategoria}
            onExcluirSubcategoria={excluirSubcategoria}
          />
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-semibold tracking-tight">Categorias</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Escolha uma categoria para ver suas subcategorias.
                </p>
              </div>
              <div className="flex flex-row items-center gap-3">
                <Button size="lg" onClick={() => setModalAberto(true)}>
                  <Plus className="size-4" />
                  Criar Categoria
                </Button>
                <Button
                  size="lg"
                  onClick={() => setModalDeletarAberto(true)}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  <Trash2 className="size-4" />
                  Deletar Categoria
                </Button>
              </div>
            </div>

            <ListaOrdenavel
              id="categorias"
              ids={categorias.map((c) => c.id)}
              onReordenar={reordenarCategorias}
            >
              <Accordion type="multiple" className="mt-8 grid gap-3 lg:grid-cols-2">
                {categorias.map((categoria) => {
                  const total = contarItens(categoria);
                  const pendentes = contarPendentes(categoria);
                  return (
                    <ItemOrdenavel
                      key={categoria.id}
                      id={categoria.id}
                      textoAlca="Mover categoria"
                      inline
                    >
                      {(alca) => (
                        <AccordionItem
                          value={categoria.id}
                          className="rounded-xl border border-border bg-card px-3 transition-colors hover:border-foreground/40"
                        >
                          <AccordionTrigger className="flex-1 py-5 text-left hover:no-underline [&>svg]:text-foreground">
                            <span className="flex flex-1 flex-col gap-1">
                              <span className="flex flex-row items-center gap-3">
                                <span className="font-medium tracking-tight">
                                  {categoria.nome}
                                </span>
                                {alca}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {categoria.subcategorias.length} subcategoria
                                {categoria.subcategorias.length === 1 ? "" : "s"}
                                {total > 0 &&
                                  ` · ${pendentes} pendente${pendentes === 1 ? "" : "s"}`}
                              </span>
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="pb-5">
                            <div className="space-y-4 border-t border-border pt-4">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                  setCategoriaAtivaId(categoria.id);
                                  setSubcategoriaAtivaId(null);
                                }}
                              >
                                Abrir categoria
                              </Button>

                              {categoria.subcategorias.length > 0 ? (
                                <div className="space-y-2">
                                  {categoria.subcategorias.map((sub) => {
                                    const subPendentes = sub.itens.filter(
                                      (i) => !i.concluido,
                                    ).length;
                                    return (
                                      <Button
                                        key={sub.id}
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                          setCategoriaAtivaId(categoria.id);
                                          setSubcategoriaAtivaId(sub.id);
                                        }}
                                        className="h-auto w-full justify-between whitespace-normal px-3 py-3 text-left"
                                      >
                                        <span>
                                          <span className="block font-medium">{sub.nome}</span>
                                          <span className="block text-xs font-normal text-muted-foreground">
                                            {sub.itens.length === 0
                                              ? "Lista vazia"
                                              : `${subPendentes} pendente${subPendentes === 1 ? "" : "s"} · ${
                                                  sub.itens.length
                                                } ${sub.itens.length === 1 ? "item" : "itens"}`}
                                          </span>
                                        </span>
                                      </Button>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  Nenhuma subcategoria ainda.
                                </p>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}
                    </ItemOrdenavel>
                  );
                })}
              </Accordion>
            </ListaOrdenavel>
          </>
        )}
      </div>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Categoria</DialogTitle>
            <DialogDescription>Dê um nome para a sua nova categoria.</DialogDescription>
          </DialogHeader>
          <form onSubmit={criarCategoria} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome-categoria">Nome da categoria</Label>
              <Input
                id="nome-categoria"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Ex.: Mercado da semana"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalAberto(false)}>
                Cancelar
              </Button>
              <Button type="submit">Criar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={modalDeletarAberto} onOpenChange={setModalDeletarAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar Categoria</DialogTitle>
            <DialogDescription>
              Escolha a categoria que você deseja excluir.
            </DialogDescription>
          </DialogHeader>
          {categorias.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma categoria para excluir.</p>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {categorias.map((categoria) => (
                <Button
                  key={categoria.id}
                  type="button"
                  variant="outline"
                  onClick={() => setCategoriaParaExcluir(categoria)}
                  className="h-auto w-full justify-between whitespace-normal px-3 py-3 text-left"
                >
                  <span className="font-medium">{categoria.nome}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {categoria.subcategorias.length} subcategoria
                    {categoria.subcategorias.length === 1 ? "" : "s"}
                  </span>
                </Button>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setModalDeletarAberto(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={categoriaParaExcluir !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setCategoriaParaExcluir(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Tem certeza que deseja excluir esta categoria e todo o seu conteúdo?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {categoriaParaExcluir
                ? `A categoria "${categoriaParaExcluir.nome}", suas subcategorias e todos os itens serão removidos permanentemente.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (categoriaParaExcluir) excluirCategoria(categoriaParaExcluir.id);
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DialogoTransferir
        aberto={itemTransferindo !== null}
        categorias={categorias}
        textoItem={itemTransferindo?.item.texto ?? ""}
        subcategoriaAtual={itemTransferindo?.subcategoriaId ?? null}
        onFechar={() => setItemTransferindo(null)}
        onEscolher={transferirItem}
      />
    </main>
  );
}
