import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Bookmark,
  ChevronDown,
  ChevronRight,
  Folder,
  Menu,
  Plus,
  Trash2,
} from "lucide-react";
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
import {
  AreaSoltavel,
  ContextoArrasto,
  ItemOrdenavel,
  ListaOrdenavel,
} from "@/components/nirvana/dnd";
import { BotaoArquivar } from "@/components/nirvana/botao-arquivar";
import {
  ESTILOS_COR_CATEGORIA,
  GradeCoresCategoria,
  TrocarCorCategoria,
} from "@/components/nirvana/cores-categoria";
import {
  normalizarPastas,
  type Pasta,
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
const CHAVE_PASTAS = "nirvana:pastas:v1";

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
  const [sidebarExpandida, setSidebarExpandida] = useState(true);
  const [pastas, setPastas] = useState<Pasta[]>([]);
  const [modalPastaAberto, setModalPastaAberto] = useState(false);
  const [modalDeletarPastaAberto, setModalDeletarPastaAberto] = useState(false);
  const [nomeNovaPasta, setNomeNovaPasta] = useState("");
  const [novaCorPasta, setNovaCorPasta] = useState<CorCategoria | null>(null);
  const [pastasAbertasCentral, setPastasAbertasCentral] = useState<string[]>([]);
  const [secaoPastasCentral, setSecaoPastasCentral] = useState(true);
  const [secaoCategoriasCentral, setSecaoCategoriasCentral] = useState(true);
  const [pastaAtivaId, setPastaAtivaId] = useState<string | null>(null);
  const [confirmarExcluirPastaAtiva, setConfirmarExcluirPastaAtiva] = useState(false);
  const [modalRemoverDaPastaAberto, setModalRemoverDaPastaAberto] = useState(false);
  const [modalImportarAberto, setModalImportarAberto] = useState(false);
  const [categoriasParaImportar, setCategoriasParaImportar] = useState<string[]>([]);
  const [categoriaParaRemoverDaPasta, setCategoriaParaRemoverDaPasta] = useState<string | null>(
    null,
  );
  const [pendenteMoverPasta, setPendenteMoverPasta] = useState<{
    categoriaId: string;
    pastaId: string;
  } | null>(null);
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
    try {
      const salvas = localStorage.getItem(CHAVE_PASTAS);
      if (salvas) setPastas(normalizarPastas(JSON.parse(salvas)));
    } catch {
      setPastas([]);
    }
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!carregado) return;
    localStorage.setItem(CHAVE, JSON.stringify(categorias));
  }, [categorias, carregado]);

  useEffect(() => {
    if (!carregado) return;
    localStorage.setItem(CHAVE_PASTAS, JSON.stringify(pastas));
  }, [pastas, carregado]);

  const categoriaAtiva = categorias.find((c) => c.id === categoriaAtivaId) ?? null;
  const subcategoriaAtiva =
    categoriaAtiva?.subcategorias.find((s) => s.id === subcategoriaAtivaId) ?? null;

  // Arquivar é apenas um status: a categoria continua no lugar original.
  const categoriasVisiveis = categorias;
  const categoriasArquivadas = categorias.filter((c) => c.arquivada);
  const subcategoriasArquivadas = categorias.flatMap((c) =>
    c.subcategorias.filter((s) => s.arquivada).map((s) => ({ categoria: c, sub: s })),
  );
  const pastasVisiveis = pastas.filter((p) => !p.arquivada);
  const pastasArquivadas = pastas.filter((p) => p.arquivada);
  const totalArquivados =
    categoriasArquivadas.length + subcategoriasArquivadas.length + pastasArquivadas.length;

  const pastaAtiva = pastas.find((p) => p.id === pastaAtivaId) ?? null;
  const categoriasDaPastaAtiva = pastaAtiva
    ? categoriasVisiveis.filter((c) => c.pastaId === pastaAtiva.id)
    : [];

  /** Arquiva a pasta e sai da vista interna. */
  const arquivarPasta = (pastaId: string) => {
    setPastas((atual) => atual.map((p) => (p.id === pastaId ? { ...p, arquivada: true } : p)));
    setPastaAtivaId(null);
  };

  const restaurarPasta = (pastaId: string) =>
    setPastas((atual) => atual.map((p) => (p.id === pastaId ? { ...p, arquivada: false } : p)));


  const abrirCategoria = (categoriaId: string) => {
    setMostrandoArquivados(false);
    setPastaAtivaId(null);
    setSubcategoriaAtivaId(null);
    setCategoriaAtivaId(categoriaId);
  };

  const abrirPasta = (pastaId: string) => {
    setMostrandoArquivados(false);
    setCategoriaAtivaId(null);
    setSubcategoriaAtivaId(null);
    setPastaAtivaId(pastaId);
  };

  /** Remove a categoria da pasta sem excluí-la: ela volta para a página principal. */
  const removerCategoriaDaPasta = (categoriaId: string) => {
    setCategorias((atual) =>
      atual.map((c) =>
        c.id === categoriaId ? { ...c, pastaId: null, manterEmCategorias: true } : c,
      ),
    );
    setCategoriaParaRemoverDaPasta(null);
    setModalRemoverDaPastaAberto(false);
  };

  const importarCategoriasParaPasta = () => {
    if (!pastaAtivaId || categoriasParaImportar.length === 0) return;
    setCategorias((atual) =>
      atual.map((c) =>
        categoriasParaImportar.includes(c.id) ? { ...c, pastaId: pastaAtivaId } : c,
      ),
    );
    setCategoriasParaImportar([]);
    setModalImportarAberto(false);
  };

  const abrirArquivados = () => {
    setCategoriaAtivaId(null);
    setSubcategoriaAtivaId(null);
    setPastaAtivaId(null);
    setMostrandoArquivados(true);
  };

  const arquivarCategoria = (categoriaId: string) => {
    setCategorias((atual) =>
      atual.map((c) => (c.id === categoriaId ? { ...c, arquivada: true } : c)),
    );
    setCategoriasAbertas((atual) => atual.filter((id) => id !== categoriaId));
  };

  const restaurarCategoria = (categoriaId: string) =>
    setCategorias((atual) =>
      atual.map((c) => (c.id === categoriaId ? { ...c, arquivada: false } : c)),
    );

  const arquivarSubcategoria = (subcategoriaId: string) => {
    patchSubcategoria(subcategoriaId, (sub) => ({ ...sub, arquivada: true }));
    if (subcategoriaAtivaId === subcategoriaId) setSubcategoriaAtivaId(null);
  };

  const restaurarSubcategoria = (subcategoriaId: string) =>
    patchSubcategoria(subcategoriaId, (sub) => ({ ...sub, arquivada: false }));

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

  // ===== Pastas =====
  const criarPasta = (e: React.FormEvent) => {
    e.preventDefault();
    const nome = nomeNovaPasta.trim();
    if (!nome || !novaCorPasta) return;
    setPastas((atual) => [...atual, { id: criarId(), nome, cor: novaCorPasta }]);
    setNomeNovaPasta("");
    setNovaCorPasta(null);
    setModalPastaAberto(false);
  };

  const excluirPasta = (pastaId: string) => {
    setPastas((atual) => atual.filter((p) => p.id !== pastaId));
    setCategorias((atual) =>
      atual.map((c) => (c.pastaId === pastaId ? { ...c, pastaId: null } : c)),
    );
    setPastaAtivaId((atual) => (atual === pastaId ? null : atual));
    setCategoriaAtivaId((atual) => {
      const categoria = categorias.find((c) => c.id === atual);
      return categoria?.pastaId === pastaId ? null : atual;
    });
  };

  const moverCategoriaParaPasta = (categoriaId: string, pastaId: string | null) =>
    setCategorias((atual) =>
      atual.map((c) => (c.id === categoriaId ? { ...c, pastaId } : c)),
    );

  // ===== Reordenação por arrastar-e-soltar =====
  const reordenarCategorias = (ativoId: string, sobreId: string) =>
    setCategorias((atual) => moverPorId(atual, ativoId, sobreId));

  const alternarPastaCentral = (pastaId: string) =>
    setPastasAbertasCentral((atual) =>
      atual.includes(pastaId) ? atual.filter((id) => id !== pastaId) : [...atual, pastaId],
    );

  const reordenarPastas = (ativoId: string, sobreId: string) =>
    setPastas((atual) => moverPorId(atual, ativoId, sobreId));

  /**
   * Trata todos os arrastos da hierarquia Pastas/Categorias:
   * reordenar pastas, aninhar categoria em pasta, tirar da pasta e reordenar.
   */
  const aoSoltarHierarquia = (ativoId: string, sobreId: string) => {
    const pastaAtiva = ativoId.startsWith("pasta:");
    const pastaAlvo = sobreId.startsWith("pasta:");

    if (pastaAtiva) {
      // Pasta só pode ser reordenada entre pastas.
      if (pastaAlvo) {
        reordenarPastas(ativoId.slice("pasta:".length), sobreId.slice("pasta:".length));
      }
      return;
    }

    const categoriaAtivaId = ativoId.startsWith("eco:")
      ? ativoId.slice("eco:".length)
      : ativoId;
    const categoriaAlvoId = sobreId.startsWith("eco:")
      ? sobreId.slice("eco:".length)
      : sobreId;

    if (pastaAlvo) {
      // Categoria solta numa pasta: pergunta antes de aplicar.
      setPendenteMoverPasta({
        categoriaId: categoriaAtivaId,
        pastaId: sobreId.slice("pasta:".length),
      });
      return;
    }

    if (sobreId === "raiz") {
      moverCategoriaParaPasta(categoriaAtivaId, null);
      return;
    }

    const alvo = categorias.find((c) => c.id === categoriaAlvoId);
    const ativa = categorias.find((c) => c.id === categoriaAtivaId);
    if (!alvo || !ativa) return;
    const destino = alvo.pastaId ?? null;
    if ((ativa.pastaId ?? null) !== destino) {
      if (destino) {
        setPendenteMoverPasta({ categoriaId: categoriaAtivaId, pastaId: destino });
        return;
      }
      moverCategoriaParaPasta(categoriaAtivaId, null);
    }
    reordenarCategorias(categoriaAtivaId, categoriaAlvoId);
  };

  /** Aplica a escolha do modal: a categoria sempre entra na pasta. */
  const confirmarMoverParaPasta = (manterEmCategorias: boolean) => {
    if (!pendenteMoverPasta) return;
    const { categoriaId, pastaId } = pendenteMoverPasta;
    setCategorias((atual) =>
      atual.map((c) => (c.id === categoriaId ? { ...c, pastaId, manterEmCategorias } : c)),
    );
    setPendenteMoverPasta(null);
  };

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

  /**
   * `eco` = segunda representação da categoria que vive dentro de uma pasta e
   * que o usuário optou por manter também na lista principal.
   */
  const cartaoCategoria = (categoria: Categoria, eco = false) => {
    const total = contarItens(categoria);
    const pendentes = contarPendentes(categoria);
    const idArrasto = eco ? `eco:${categoria.id}` : categoria.id;
    return (
      <ItemOrdenavel
        key={idArrasto}
        id={idArrasto}
        tipo="categoria"
        textoAlca="Mover categoria"
        inline
        alcaIcone
        alcaBoxClassName="h-8 w-8 -translate-x-[0.1cm]"
        alcaImgClassName="h-7 w-7"
      >
        {(alca) => (
          <AccordionItem
            value={idArrasto}
            className={`group relative flex min-h-[100px] w-full min-w-0 max-w-full flex-col overflow-hidden rounded-xl border border-black transition-colors hover:border-foreground/40 lg:min-h-[132px] ${
              categoria.arquivada ? "bg-gray-100 opacity-60" : "bg-white"
            }`}
          >
            <AccordionTrigger
              showChevron={false}
              className="relative flex min-h-[68px] w-full min-w-0 max-w-full flex-1 flex-col items-start pr-[120px] text-left text-white hover:no-underline sm:pr-[260px]"
            >
              <div className={`absolute inset-y-0 left-0 flex min-w-0 max-w-[60%] flex-col items-start gap-1 border-r border-black py-4 pl-4 pr-6 lg:max-w-[40%] ${ESTILOS_COR_CATEGORIA[categoria.cor].fundo}`}>
                <span className="flex w-full min-w-0 items-center gap-2 font-medium tracking-tight text-white">
                  <span className="truncate">{categoria.nome}</span>
                  {categoria.arquivada ? (
                    <span className="shrink-0 rounded-full bg-white/90 px-2 py-0.5 text-[10px] text-gray-700">
                      ARQUIVADO
                    </span>
                  ) : null}
                </span>
                <span className="text-xs text-white/80">
                  {categoria.subcategorias.length} subcategoria
                  {categoria.subcategorias.length === 1 ? "" : "s"}
                  {total > 0 && ` · ${pendentes} pendente${pendentes === 1 ? "" : "s"}`}
                </span>
                {categoria.nome.includes("Urgente") && (
                  <span className="mt-1 flex flex-row items-center gap-1.5 animate-heartbeat">
                    <Bookmark
                      size={38}
                      strokeWidth={2.5}
                      className="shrink-0 text-red-600 fill-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.9)]"
                    />
                    <span className="text-2xl font-black text-red-600 tabular-nums drop-shadow-[0_0_10px_rgba(220,38,38,0.9)]">
                      {pendentes}
                    </span>
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
              <TrocarCorCategoria
                corAtual={categoria.cor}
                onSelecionar={(cor) => trocarCorCategoria(categoria.id, cor)}
                rotulo="cor"
              />
              <ChevronDown
                size={28}
                strokeWidth={3}
                className="pointer-events-none h-7 w-7 text-black transition-transform duration-200"
              />
            </div>
            <div className="absolute top-3 right-3 z-10 flex flex-row items-center gap-1.5">
              <div className="flex flex-row items-center">
                {alca}
                <button
                  type="button"
                  onClick={() => abrirCriarSubcategoria(categoria.id)}
                  aria-label="Adicionar Subcategoria"
                  className="ml-[0.05cm] inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-black bg-white p-0 text-black transition-colors hover:bg-black/5"
                >
                  <Plus className="size-[18px]" strokeWidth={2.5} />
                </button>
              </div>
              {categoria.arquivada ? (
                <button
                  type="button"
                  aria-label={`Restaurar ${categoria.nome}`}
                  title="Restaurar"
                  onClick={() => restaurarCategoria(categoria.id)}
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-blue-300 bg-white p-0 text-blue-600 transition-colors hover:bg-blue-50"
                >
                  <ArchiveRestore className="size-[18px]" strokeWidth={2.5} />
                </button>
              ) : (
                <BotaoArquivar
                  rotulo={`Arquivar ${categoria.nome}`}
                  onArquivar={() => arquivarCategoria(categoria.id)}
                />
              )}
            </div>
            <AccordionContent className="mb-4 mx-4 mt-3 rounded-lg bg-card p-4 pb-5">
              <div className="space-y-4">
                {categoria.subcategorias.length > 0 ? (
                  <SubcategoriasAccordion
                    categoria={categoria}
                    modoCompras={categoria.cor === "Gold"}
                    subcategoriasAbertas={subcategoriasAbertasPorCategoria[categoria.id] ?? []}
                    onSubcategoriasAbertasChange={(subcategoriasAbertas) =>
                      atualizarSubcategoriasAbertas(categoria.id, subcategoriasAbertas)
                    }
                    onReordenarSubcategorias={(ativoId, sobreId) =>
                      reordenarSubcategorias(categoria.id, ativoId, sobreId)
                    }
                    onRenomearSubcategoria={renomearSubcategoria}
                    onExcluirSubcategoria={excluirSubcategoria}
                    onArquivarSubcategoria={arquivarSubcategoria}
                    onRestaurarSubcategoria={restaurarSubcategoria}
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
                  <p className="text-sm text-muted-foreground">Nenhuma subcategoria ainda.</p>
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
  };

  return (
    <div className="relative h-screen w-full bg-white">
      <SidebarCategorias
        categorias={categoriasVisiveis}
        pastas={pastasVisiveis}
        onCriarPasta={() => {
          setNomeNovaPasta("");
          setModalPastaAberto(true);
        }}
        onDeletarPasta={() => setModalDeletarPastaAberto(true)}
        onSelecionarPasta={abrirPasta}
        onMoverCategoriaParaPasta={moverCategoriaParaPasta}
        onSoltarHierarquia={aoSoltarHierarquia}
        onCriarCategoria={() => setModalAberto(true)}
        onDeletarCategoria={() => setModalDeletarAberto(true)}
        onSelecionarCategoria={(categoriaId) => {
          setMostrandoArquivados(false);
          setPastaAtivaId(null);
          setCategoriaAtivaId(categoriaId);
          setSubcategoriaAtivaId(null);
        }}
        onReordenarCategorias={reordenarCategorias}
        onAbrirArquivados={abrirArquivados}
        totalArquivados={totalArquivados}
        expandido={sidebarExpandida}
        onAlternarExpansao={() => setSidebarExpandida((v) => !v)}
      />
      <main className="relative h-screen w-full max-w-full overflow-x-hidden overflow-y-auto bg-background">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-5">
          <button
            type="button"
            onClick={() => setSidebarExpandida((v) => !v)}
            aria-label="Abrir menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/30 bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <Menu className="size-5" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => {
              setMostrandoArquivados(false);
              setPastaAtivaId(null);
              setCategoriaAtivaId(null);
              setSubcategoriaAtivaId(null);
            }}
            className="flex flex-row items-center gap-3"
          >
            <svg
              viewBox="0 0 40 40"
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 rounded-md shadow-sm"
              role="img"
              aria-label="Nirvana"
            >
              <rect width="40" height="40" rx="9" fill="#FFFFFF" />
              <path
                d="M8 8H14V22L26 8H32V32H26V18L14 32H8Z"
                fill="url(#nirvana-n-grad)"
              />
              <defs>
                <linearGradient
                  id="nirvana-n-grad"
                  x1="8"
                  y1="8"
                  x2="32"
                  y2="32"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#0B192C" />
                  <stop offset="1" stopColor="#112745" />
                </linearGradient>
              </defs>
            </svg>
            <span className="font-display text-lg font-semibold tracking-tight">Nirvana</span>
          </button>
        </div>
      </header>

      <div className="mx-auto w-full min-w-0 max-w-5xl overflow-x-hidden px-6 py-10">
        {mostrandoArquivados ? (
          <section className="space-y-6">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight">Arquivados</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Pastas, categorias e subcategorias guardadas aqui. Restaure quando quiser.
              </p>
            </div>

            {totalArquivados === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                Nada arquivado ainda.
              </p>
            ) : (
              <div className="space-y-3">
                {pastasArquivadas.map((pasta) => (
                  <div
                    key={pasta.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black bg-white px-4 py-3"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Folder
                        className={`size-5 shrink-0 ${ESTILOS_COR_CATEGORIA[pasta.cor].texto}`}
                        strokeWidth={2.5}
                        fill="currentColor"
                      />
                      <button
                        type="button"
                        onClick={() => abrirPasta(pasta.id)}
                        className="truncate text-sm font-medium text-black hover:underline"
                      >
                        {pasta.nome}
                      </button>
                      <span className="text-xs text-muted-foreground">Pasta</span>
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => restaurarPasta(pasta.id)}
                    >
                      Restaurar
                    </Button>
                  </div>
                ))}
                {categoriasArquivadas.map((categoria) => (
                  <div
                    key={categoria.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black bg-white px-4 py-3"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className={`size-3 shrink-0 rounded-sm border border-black ${ESTILOS_COR_CATEGORIA[categoria.cor].fundo}`}
                      />
                      <button
                        type="button"
                        onClick={() => abrirCategoria(categoria.id)}
                        className="truncate text-sm font-medium text-black hover:underline"
                      >
                        {categoria.nome}
                      </button>
                      <span className="text-xs text-muted-foreground">Categoria</span>
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => restaurarCategoria(categoria.id)}
                    >
                      Restaurar
                    </Button>
                  </div>
                ))}
                {subcategoriasArquivadas.map(({ categoria, sub }) => (
                  <div
                    key={sub.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black bg-white px-4 py-3"
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="text-sm font-medium text-black">{sub.nome}</span>
                      <span className="text-xs text-muted-foreground">
                        Subcategoria de {categoria.nome}
                      </span>
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => restaurarSubcategoria(sub.id)}
                    >
                      Restaurar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : categoriaAtiva && subcategoriaAtiva ? (
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
            onArquivar={() =>
              setCategorias((atual) =>
                atual.map((c) => (c.id === categoriaAtiva.id ? { ...c, arquivada: true } : c)),
              )
            }
            onRestaurar={() => restaurarCategoria(categoriaAtiva.id)}
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
        ) : pastaAtiva ? (
          <section className="w-full min-w-0 max-w-full">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-row items-center gap-3">
                <button
                  type="button"
                  aria-label="Voltar para o menu principal"
                  onClick={() => {
                    setPastaAtivaId(null);
                    setCategoriaAtivaId(null);
                  }}
                  className="cursor-pointer rounded-full p-2 transition-colors hover:bg-gray-100"
                >
                  <ArrowLeft className="size-6" strokeWidth={2.5} />
                </button>
                <Folder
                  className={`size-8 shrink-0 ${ESTILOS_COR_CATEGORIA[pastaAtiva.cor].texto}`}
                  strokeWidth={2.5}
                  fill="currentColor"
                />
                <div>
                  <h1 className="flex items-center font-display text-3xl font-semibold tracking-tight">
                    {pastaAtiva.nome}
                    {pastaAtiva.arquivada ? (
                      <span className="ml-4 rounded-full bg-gray-200 px-2 py-1 text-[10px] text-gray-600">
                        ARQUIVADO
                      </span>
                    ) : null}
                  </h1>
                  <p className="text-sm text-black/60">
                    {categoriasDaPastaAtiva.length}{" "}
                    {categoriasDaPastaAtiva.length === 1 ? "categoria" : "categorias"}
                  </p>
                </div>
              </div>
              <div className="flex flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCategoriasParaImportar([]);
                    setModalImportarAberto(true);
                  }}
                  className="rounded-md bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
                >
                  Importar Categorias
                </button>
                <button
                  type="button"
                  onClick={() => setModalRemoverDaPastaAberto(true)}
                  className="rounded-md bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700"
                >
                  Excluir Categoria da Pasta
                </button>
                {pastaAtiva.arquivada ? (
                  <button
                    type="button"
                    aria-label="Restaurar Pasta"
                    title="Restaurar Pasta"
                    onClick={() => restaurarPasta(pastaAtiva.id)}
                    className="rounded-md border border-blue-300 p-2 text-blue-600 transition-colors hover:bg-blue-50"
                  >
                    <ArchiveRestore className="size-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    aria-label="Arquivar Pasta"
                    title="Arquivar Pasta"
                    onClick={() => arquivarPasta(pastaAtiva.id)}
                    className="rounded-md border border-gray-300 p-2 text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    <Archive className="size-5" />
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Deletar Pasta"
                  title="Deletar Pasta"
                  onClick={() => setConfirmarExcluirPastaAtiva(true)}
                  className="rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="size-5" />
                </button>
              </div>
            </div>

            {categoriasDaPastaAtiva.length > 0 ? (
              <ContextoArrasto
                ids={categoriasDaPastaAtiva.map((c) => c.id)}
                onSoltar={aoSoltarHierarquia}
              >
                <Accordion
                  type="multiple"
                  value={categoriasAbertas}
                  onValueChange={atualizarCategoriasAbertas}
                  className="mt-8 grid w-full min-w-0 max-w-full gap-3 pr-4 lg:grid-cols-2"
                >
                  {categoriasDaPastaAtiva.map((categoria) => cartaoCategoria(categoria))}
                </Accordion>
              </ContextoArrasto>
            ) : (
              <p className="mt-8 text-sm text-black/60">
                Esta pasta ainda não tem categorias. Arraste uma categoria para dentro dela.
              </p>
            )}
          </section>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <button
                type="button"
                onClick={() => setSecaoPastasCentral((v) => !v)}
                className="flex cursor-pointer items-center gap-2 text-left"
              >
                <h1 className="font-display text-3xl font-semibold tracking-tight">Pastas</h1>
                {secaoPastasCentral ? (
                  <ChevronDown className="size-6" strokeWidth={3} />
                ) : (
                  <ChevronRight className="size-6" strokeWidth={3} />
                )}
              </button>
              {secaoPastasCentral ? (
                <div className="flex flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setModalPastaAberto(true)}
                    className="inline-flex items-center justify-start gap-1.5 rounded-md bg-black pl-2 pr-3 py-2 text-sm font-medium text-white transition-colors hover:bg-black/90"
                  >
                    <Plus className="size-4 shrink-0" strokeWidth={2.5} />
                    Criar
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalDeletarPastaAberto(true)}
                    className="inline-flex items-center justify-start gap-1.5 rounded-md bg-red-600 pl-2 pr-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                  >
                    <Trash2 className="size-4 shrink-0" strokeWidth={2.5} />
                    Del.
                  </button>
                </div>
              ) : null}
            </div>

            <ContextoArrasto
              ids={[
                ...pastasVisiveis.map((p) => `pasta:${p.id}`),
                ...categoriasVisiveis.flatMap((c) =>
                  c.pastaId && c.manterEmCategorias !== false ? [c.id, `eco:${c.id}`] : [c.id],
                ),
              ]}
              onSoltar={aoSoltarHierarquia}
            >
              {!secaoPastasCentral ? null : pastasVisiveis.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {pastasVisiveis.map((pasta) => {
                    const dentro = categoriasVisiveis.filter((c) => c.pastaId === pasta.id);
                    const aberta = pastasAbertasCentral.includes(pasta.id);
                    return (
                      <ItemOrdenavel
                        key={pasta.id}
                        id={`pasta:${pasta.id}`}
                        tipo="pasta"
                        textoAlca="Mover pasta"
                        inline
                        alcaIcone
                      >
                        {(alca) => (
                          <div className="rounded-xl border border-black bg-white">
                            <div className="flex flex-row items-center gap-3 px-4 py-3">
                              <Folder
                                className={`size-5 shrink-0 ${ESTILOS_COR_CATEGORIA[pasta.cor].texto}`}
                                strokeWidth={2.5}
                                fill="currentColor"
                              />
                              <button
                                type="button"
                                onClick={() => abrirPasta(pasta.id)}
                                className="min-w-0 text-left"
                              >
                                <span className="block truncate text-sm font-semibold text-black">
                                  {pasta.nome}
                                </span>
                                <span className="block text-xs text-black/60">
                                  {dentro.length} {dentro.length === 1 ? "categoria" : "categorias"}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => alternarPastaCentral(pasta.id)}
                                aria-label={`Expandir ${pasta.nome}`}
                                className="shrink-0"
                              >
                                <ChevronDown
                                  className={`size-5 shrink-0 text-black transition-transform duration-200 ${aberta ? "rotate-180" : ""}`}
                                  strokeWidth={3}
                                />
                              </button>
                              {alca}
                            </div>
                            {aberta ? (
                              <div className="border-t border-black/20 p-3">
                                {dentro.length > 0 ? (
                                  <Accordion
                                    type="multiple"
                                    value={categoriasAbertas}
                                    onValueChange={atualizarCategoriasAbertas}
                                    className="grid gap-3"
                                  >
                                    {dentro.map((categoria) => cartaoCategoria(categoria))}
                                  </Accordion>
                                ) : (
                                  <p className="px-1 py-2 text-xs text-black/50">
                                    Arraste uma categoria para dentro desta pasta.
                                  </p>
                                )}
                              </div>
                            ) : null}
                          </div>
                        )}
                      </ItemOrdenavel>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-6 text-sm text-black/60">
                  Nenhuma pasta ainda. Crie uma pasta para agrupar categorias.
                </p>
              )}

              <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setSecaoCategoriasCentral((v) => !v)}
                  className="flex cursor-pointer items-center gap-2 text-left"
                >
                  <h1 className="font-display text-3xl font-semibold tracking-tight">Categorias</h1>
                  {secaoCategoriasCentral ? (
                    <ChevronDown className="size-6" strokeWidth={3} />
                  ) : (
                    <ChevronRight className="size-6" strokeWidth={3} />
                  )}
                </button>
                {secaoCategoriasCentral ? (
                  <div className="flex flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setModalAberto(true)}
                      className="inline-flex items-center justify-start gap-1.5 rounded-md bg-black pl-2 pr-3 py-2 text-sm font-medium text-white transition-colors hover:bg-black/90"
                    >
                      <Plus className="size-4" />
                      Criar
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalDeletarAberto(true)}
                      className="inline-flex items-center justify-start gap-1.5 rounded-md bg-red-600 pl-2 pr-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                    >
                      <Trash2 className="size-4" />
                      Del.
                    </button>
                  </div>
                ) : null}
              </div>

              <AreaSoltavel
                id="raiz"
                tipo="categoria"
                classNameAtiva="rounded-xl ring-2 ring-blue-500"
              >
                <Accordion
                  type="multiple"
                  value={categoriasAbertas}
                  onValueChange={atualizarCategoriasAbertas}
                  className="mt-8 grid w-full min-w-0 max-w-full gap-3 pr-4 lg:grid-cols-2"
                >
                  {secaoCategoriasCentral
                    ? categoriasVisiveis
                        .filter((c) => !c.pastaId || c.manterEmCategorias !== false)
                        .map((categoria) => cartaoCategoria(categoria, !!categoria.pastaId))
                    : []}
                </Accordion>
              </AreaSoltavel>
            </ContextoArrasto>
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

      <Dialog
        open={modalPastaAberto}
        onOpenChange={(aberto) => {
          setModalPastaAberto(aberto);
          if (!aberto) {
            setNomeNovaPasta("");
            setNovaCorPasta(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Pasta</DialogTitle>
            <DialogDescription>
              Dê um nome e escolha uma cor para a pasta. Depois arraste categorias para dentro dela.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={criarPasta} className="space-y-4">
            <Input
              autoFocus
              value={nomeNovaPasta}
              onChange={(e) => setNomeNovaPasta(e.target.value)}
              placeholder="Nome da pasta"
            />
            <div className="space-y-2">
              <p className="text-sm font-medium text-black">Cor da pasta</p>
              <GradeCoresCategoria selecionada={novaCorPasta} onSelecionar={setNovaCorPasta} />
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setModalPastaAberto(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!nomeNovaPasta.trim() || !novaCorPasta}>
                Criar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmarExcluirPastaAtiva}
        onOpenChange={setConfirmarExcluirPastaAtiva}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pasta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta pasta? A exclusão da pasta é permanente.
              As categorias dentro dela não são apagadas: elas voltam para a página
              principal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                if (pastaAtivaId) excluirPasta(pastaAtivaId);
                setConfirmarExcluirPastaAtiva(false);
              }}
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={modalDeletarPastaAberto} onOpenChange={setModalDeletarPastaAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar Pasta</DialogTitle>
            <DialogDescription>
              As categorias dentro da pasta não são excluídas: elas voltam para a lista de
              categorias.
            </DialogDescription>
          </DialogHeader>
          {pastasVisiveis.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma pasta para excluir.</p>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {pastasVisiveis.map((pasta) => (
                <div
                  key={pasta.id}
                  className="flex flex-row items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
                >
                  <span className="min-w-0 break-words text-sm font-medium">{pasta.nome}</span>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => excluirPasta(pasta.id)}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    <Trash2 className="size-4" />
                    Excluir
                  </Button>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalDeletarPastaAberto(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!pendenteMoverPasta}
        onOpenChange={(aberto) => {
          if (!aberto) setPendenteMoverPasta(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mover para a pasta</DialogTitle>
            <DialogDescription>
              Você deseja manter apenas na pasta ou também em Categorias?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => confirmarMoverParaPasta(true)}
            >
              Manter também em Categorias
            </Button>
            <Button type="button" onClick={() => confirmarMoverParaPasta(false)}>
              Apenas na pasta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalRemoverDaPastaAberto} onOpenChange={setModalRemoverDaPastaAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Categoria da Pasta</DialogTitle>
            <DialogDescription>
              Escolha qual categoria você quer remover desta pasta. A categoria não é apagada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {categoriasDaPastaAtiva.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma categoria nesta pasta.</p>
            ) : (
              categoriasDaPastaAtiva.map((categoria) => (
                <div
                  key={categoria.id}
                  className="flex flex-row items-center justify-between gap-3 rounded-md border border-black bg-white px-3 py-2"
                >
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-black">
                    {categoria.nome}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCategoriaParaRemoverDaPasta(categoria.id)}
                    className="rounded-md bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-700"
                  >
                    Remover
                  </button>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalRemoverDaPastaAberto(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalImportarAberto} onOpenChange={setModalImportarAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Categorias</DialogTitle>
            <DialogDescription>
              Selecione as categorias fora desta pasta que você quer trazer para dentro dela.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {categoriasVisiveis.filter((c) => c.pastaId !== pastaAtivaId).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma categoria disponível fora desta pasta.
              </p>
            ) : (
              categoriasVisiveis
                .filter((c) => c.pastaId !== pastaAtivaId)
                .map((categoria) => (
                  <label
                    key={categoria.id}
                    className="flex cursor-pointer flex-row items-center gap-3 rounded-md border border-black bg-white px-3 py-2"
                  >
                    <input
                      type="checkbox"
                      checked={categoriasParaImportar.includes(categoria.id)}
                      onChange={(e) =>
                        setCategoriasParaImportar((atual) =>
                          e.target.checked
                            ? [...atual, categoria.id]
                            : atual.filter((id) => id !== categoria.id),
                        )
                      }
                      className="size-4 accent-blue-600"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-black">
                      {categoria.nome}
                    </span>
                  </label>
                ))
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalImportarAberto(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={importarCategoriasParaPasta}
              disabled={categoriasParaImportar.length === 0}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!categoriaParaRemoverDaPasta}
        onOpenChange={(aberto) => {
          if (!aberto) setCategoriaParaRemoverDaPasta(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover da pasta?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta categoria da pasta? Ela voltará para a página
              principal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                if (categoriaParaRemoverDaPasta)
                  removerCategoriaDaPasta(categoriaParaRemoverDaPasta);
              }}
            >
              Remover da pasta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </main>
    </div>
  );
}
