import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown, ListChecks, Plus, Trash2 } from "lucide-react";
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
import { SubcategoriasAccordion } from "@/components/nirvana/subcategorias-accordion";
import { SidebarCategorias } from "@/components/nirvana/sidebar-categorias";
import { DialogoTransferir } from "@/components/nirvana/dialogo-transferir";
import { ItemOrdenavel, ListaOrdenavel } from "@/components/nirvana/dnd";
import { BotaoArquivar } from "@/components/nirvana/botao-arquivar";
import {
  ESTILOS_COR_CATEGORIA,
  GradeCoresCategoria,
  TrocarCorCategoria,
} from "@/components/nirvana/cores-categoria";
import {
  categoriasIniciais,
  contarItens,
  contarPendentes,
  criarId,
  formatarBRL,
  itensExibidos,
  moverPorId,
  normalizarCategorias,
  totalCategoria,
  type Categoria,
  type CorCategoria,
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
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaAtivaId, setCategoriaAtivaId] = useState<string | null>(null);
  const [subcategoriaAtivaId, setSubcategoriaAtivaId] = useState<string | null>(null);
  const [categoriasAbertas, setCategoriasAbertas] = useState<string[]>([]);
  const [subcategoriasAbertasPorCategoria, setSubcategoriasAbertasPorCategoria] = useState<
    Record<string, string[]>
  >({});
  const [modalAberto, setModalAberto] = useState(false);
  const [modalDeletarAberto, setModalDeletarAberto] = useState(false);
  const [categoriaParaExcluir, setCategoriaParaExcluir] = useState<Categoria | null>(null);
  const [novoNome, setNovoNome] = useState("");
  const [novaCorCategoria, setNovaCorCategoria] = useState<CorCategoria | null>(null);
  const [carregado, setCarregado] = useState(false);
  const [categoriaCriandoSubId, setCategoriaCriandoSubId] = useState<string | null>(null);
  const [nomeNovaSub, setNomeNovaSub] = useState("");
  const [mostrandoArquivados, setMostrandoArquivados] = useState(false);
  const [itemTransferindo, setItemTransferindo] = useState<{
    item: Item;
    subcategoriaId: string;
  } | null>(null);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE);
      if (salvo) {
        const categoriasSalvas = JSON.parse(salvo) as Categoria[];
        setCategorias(normalizarCategorias(categoriasSalvas));
      } else {
        setCategorias(categoriasIniciais());
      }
    } catch {
      setCategorias(categoriasIniciais());
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
    if (!nome || !novaCorCategoria) return;
    setCategorias((atual) => [
      ...atual,
      {
        id: criarId(),
        nome,
        cor: novaCorCategoria,
        isShoppingList: novaCorCategoria === "Gold",
        subcategorias: [],
      },
    ]);
    setNovoNome("");
    setNovaCorCategoria(null);
    setModalAberto(false);
  };

  const trocarCorCategoria = (categoriaId: string, cor: CorCategoria) =>
    setCategorias((atual) =>
      atual.map((c) => (c.id === categoriaId ? { ...c, cor, isShoppingList: cor === "Gold" } : c)),
    );

  const atualizarCategoriasAbertas = (novasCategoriasAbertas: string[]) => {
    const categoriasFechadas = categoriasAbertas.filter(
      (categoriaId) => !novasCategoriasAbertas.includes(categoriaId),
    );

    if (categoriasFechadas.length > 0) {
      setSubcategoriasAbertasPorCategoria((atual) => {
        const proximo = { ...atual };
        categoriasFechadas.forEach((categoriaId) => {
          proximo[categoriaId] = [];
        });
        return proximo;
      });
    }

    setCategoriasAbertas(novasCategoriasAbertas);
  };

  const atualizarSubcategoriasAbertas = (
    categoriaId: string,
    novasSubcategoriasAbertas: string[],
  ) =>
    setSubcategoriasAbertasPorCategoria((atual) => ({
      ...atual,
      [categoriaId]: novasSubcategoriasAbertas,
    }));

  const excluirCategoria = (categoriaId: string) => {
    setCategorias((atual) => atual.filter((c) => c.id !== categoriaId));
    setCategoriasAbertas((atual) => atual.filter((id) => id !== categoriaId));
    setSubcategoriasAbertasPorCategoria((atual) => {
      const { [categoriaId]: _removida, ...restante } = atual;
      return restante;
    });
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

  const abrirCriarSubcategoria = (categoriaId: string) => {
    setNomeNovaSub("");
    setCategoriaCriandoSubId(categoriaId);
    if (!categoriasAbertas.includes(categoriaId)) {
      setCategoriasAbertas((abertas) => [...abertas, categoriaId]);
    }
  };

  const confirmarCriarSubcategoria = () => {
    const nome = nomeNovaSub.trim();
    if (!categoriaCriandoSubId || !nome) return;
    criarSubcategoria(categoriaCriandoSubId, nome);
    setCategoriaCriandoSubId(null);
    setNomeNovaSub("");
  };

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

  const adicionarItem = (subcategoriaId: string, texto: string) =>
    atualizarSubcategoria(subcategoriaId, (itens) => [
      ...itens,
      {
        id: criarId(),
        texto,
        concluido: false,
        prioridade: null,
        precoUnitario: 0,
        quantidade: 1,
      },
    ]);

  const alternarItem = (subcategoriaId: string, itemId: string) =>
    patchSubcategoria(subcategoriaId, (sub) => ({
      ...sub,
      ordemManual: false,
      itens: sub.itens.map((i) => (i.id === itemId ? { ...i, concluido: !i.concluido } : i)),
    }));

  const removerItem = (subcategoriaId: string, itemId: string) =>
    atualizarSubcategoria(subcategoriaId, (itens) => itens.filter((i) => i.id !== itemId));

  const definirPrioridade = (subcategoriaId: string, itemId: string, prioridade: Prioridade) =>
    atualizarSubcategoria(subcategoriaId, (itens) =>
      itens.map((i) =>
        i.id === itemId
          ? {
              ...i,
              prioridade: i.prioridade === prioridade ? null : prioridade,
            }
          : i,
      ),
    );

  const atualizarValoresItem = (
    subcategoriaId: string,
    itemId: string,
    valores: { precoUnitario?: number; quantidade?: number },
  ) =>
    atualizarSubcategoria(subcategoriaId, (itens) =>
      itens.map((i) => (i.id === itemId ? { ...i, ...valores } : i)),
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
    <div className="flex h-screen w-full bg-white">
      <SidebarCategorias
        categorias={categorias}
        onCriarCategoria={() => setModalAberto(true)}
        onSelecionarCategoria={(categoriaId) => {
          setCategoriaAtivaId(categoriaId);
          setSubcategoriaAtivaId(null);
        }}
        onReordenarCategorias={reordenarCategorias}
      />
      <main className="flex-1 overflow-y-auto bg-background">
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
            modoCompras={categoriaAtiva.cor === "Gold"}
            onVoltar={() => setSubcategoriaAtivaId(null)}
            onAdicionarItem={(texto) => adicionarItem(subcategoriaAtiva.id, texto)}
            onAlternarItem={(itemId) => alternarItem(subcategoriaAtiva.id, itemId)}
            onRemoverItem={(itemId) => removerItem(subcategoriaAtiva.id, itemId)}
            onDefinirPrioridade={(itemId, prioridade) =>
              definirPrioridade(subcategoriaAtiva.id, itemId, prioridade)
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
              atualizarValoresItem(subcategoriaAtiva.id, itemId, valores)
            }
          />
        ) : categoriaAtiva ? (
          <CategoriaView
            categoria={categoriaAtiva}
            onVoltar={() => setCategoriaAtivaId(null)}
            onTrocarCor={(cor) => trocarCorCategoria(categoriaAtiva.id, cor)}
            onCriarSubcategoria={(nome) => criarSubcategoria(categoriaAtiva.id, nome)}
            onReordenarSubcategorias={(ativoId, sobreId) =>
              reordenarSubcategorias(categoriaAtiva.id, ativoId, sobreId)
            }
            onRenomearSubcategoria={renomearSubcategoria}
            onExcluirSubcategoria={excluirSubcategoria}
            onMarcarTodos={marcarTodosItens}
            onAdicionarItem={adicionarItem}
            onAlternarItem={alternarItem}
            onRemoverItem={removerItem}
            onDefinirPrioridade={definirPrioridade}
            onTransferir={(subcategoriaId, item) => setItemTransferindo({ item, subcategoriaId })}
            onReordenarItens={reordenarItens}
            onRestaurarOrdem={restaurarOrdemAutomatica}
            onAtualizarValores={atualizarValoresItem}
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
              <Accordion
                type="multiple"
                value={categoriasAbertas}
                onValueChange={atualizarCategoriasAbertas}
                className="mt-8 grid gap-3 lg:grid-cols-2"
              >
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
                            className="group relative flex min-h-[100px] flex-col overflow-hidden rounded-xl border border-black bg-white transition-colors hover:border-foreground/40 lg:min-h-[132px]"
                          >
                            <AccordionTrigger
                              showChevron={false}
                              className="relative flex min-h-[68px] min-w-0 flex-1 flex-col items-start pr-[260px] text-left text-white hover:no-underline"
                            >
                              <div className={`absolute inset-y-0 left-0 flex min-w-0 max-w-[60%] flex-col items-start gap-1 border-r border-black py-4 pl-4 pr-6 lg:max-w-[40%] ${ESTILOS_COR_CATEGORIA[categoria.cor].fundo}`}>
                                <span className="w-full truncate font-medium tracking-tight text-white">
                                  {categoria.nome}
                                </span>
                                <span className="text-xs text-white/80">
                                  {categoria.subcategorias.length} subcategoria
                                  {categoria.subcategorias.length === 1 ? "" : "s"}
                                  {total > 0 &&
                                    ` · ${pendentes} pendente${pendentes === 1 ? "" : "s"}`}
                                </span>
                              </div>
                              <ChevronDown
                                size={28}
                                strokeWidth={3}
                                className="pointer-events-none absolute bottom-3 right-3 h-7 w-7 text-black transition-transform duration-200"
                              />
                            </AccordionTrigger>
                            <div className="absolute right-3 top-3 z-10 flex flex-row flex-wrap items-center justify-end gap-2 lg:max-w-[58%]">
                              <button
                                type="button"
                                onClick={() => abrirCriarSubcategoria(categoria.id)}
                                aria-label="Adicionar Subcategoria"
                                className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-black bg-white p-0 text-black transition-colors hover:bg-black/5"
                              >
                                <Plus className="size-[18px]" strokeWidth={2.5} />
                              </button>
                              {alca}
                              <TrocarCorCategoria
                                corAtual={categoria.cor}
                                onSelecionar={(cor) => trocarCorCategoria(categoria.id, cor)}
                              />
                            </div>
                            <AccordionContent className="mb-4 mx-4 mt-3 rounded-lg bg-card p-4 pb-5">
                            <div className="space-y-4">
                              {categoria.subcategorias.length > 0 ? (
                                <SubcategoriasAccordion
                                  categoria={categoria}
                                  modoCompras={categoria.cor === "Gold"}
                                  subcategoriasAbertas={
                                    subcategoriasAbertasPorCategoria[categoria.id] ?? []
                                  }
                                  onSubcategoriasAbertasChange={(subcategoriasAbertas) =>
                                    atualizarSubcategoriasAbertas(
                                      categoria.id,
                                      subcategoriasAbertas,
                                    )
                                  }
                                  onReordenarSubcategorias={(ativoId, sobreId) =>
                                    reordenarSubcategorias(categoria.id, ativoId, sobreId)
                                  }
                                  onRenomearSubcategoria={renomearSubcategoria}
                                  onExcluirSubcategoria={excluirSubcategoria}
                                  onMarcarTodos={marcarTodosItens}
                                  onAdicionarItem={adicionarItem}
                                  onAlternarItem={alternarItem}
                                  onRemoverItem={removerItem}
                                  onDefinirPrioridade={definirPrioridade}
                                  onTransferir={(subcategoriaId, item) =>
                                    setItemTransferindo({ item, subcategoriaId })
                                  }
                                  onReordenarItens={reordenarItens}
                                  onRestaurarOrdem={restaurarOrdemAutomatica}
                                  onAtualizarValores={atualizarValoresItem}
                                />
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  Nenhuma subcategoria ainda.
                                </p>
                              )}
                              {categoria.cor === "Gold" && (
                                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-secondary px-4 py-3">
                                  <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                                    Resultado
                                  </span>
                                  <span className="font-display text-lg font-semibold tracking-tight tabular-nums">
                                    {formatarBRL(totalCategoria(categoria))}
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
              </Accordion>
            </ListaOrdenavel>
          </>
        )}
      </div>

      <Dialog
        open={modalAberto}
        onOpenChange={(aberto) => {
          setModalAberto(aberto);
          if (!aberto) {
            setNovoNome("");
            setNovaCorCategoria(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Categoria</DialogTitle>
            <DialogDescription>
              Dê um nome e selecione uma cor para a sua nova categoria.
            </DialogDescription>
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
            <div className="space-y-2">
              <Label>Cor da categoria</Label>
              <GradeCoresCategoria
                selecionada={novaCorCategoria}
                onSelecionar={setNovaCorCategoria}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalAberto(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!novoNome.trim() || !novaCorCategoria}>
                Criar
              </Button>
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

      <Dialog
        open={categoriaCriandoSubId !== null}
        onOpenChange={(aberto) => {
          if (!aberto) {
            setCategoriaCriandoSubId(null);
            setNomeNovaSub("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Subcategoria</DialogTitle>
            <DialogDescription>
              {categoriaCriandoSubId
                ? `Nova subcategoria em "${categorias.find((c) => c.id === categoriaCriandoSubId)?.nome ?? ""}".`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              confirmarCriarSubcategoria();
            }}
          >
            <Input
              autoFocus
              value={nomeNovaSub}
              onChange={(e) => setNomeNovaSub(e.target.value)}
              placeholder="Nome da subcategoria"
            />
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCategoriaCriandoSubId(null);
                  setNomeNovaSub("");
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={!nomeNovaSub.trim()}>
                Criar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </main>
    </div>
  );
}
