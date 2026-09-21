import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronRight, ListChecks, Plus } from "lucide-react";
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
import {
  categoriasIniciais,
  criarId,
  type Categoria,
} from "@/components/nirvana/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nirvana — Suas listas organizadas" },
      {
        name: "description",
        content:
          "Nirvana é um aplicativo minimalista de listas para organizar tarefas do dia, compras e viagens.",
      },
      { property: "og:title", content: "Nirvana — Suas listas organizadas" },
      {
        property: "og:description",
        content:
          "Organize tarefas diárias, compras e viagens em listas simples e elegantes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NirvanaPage,
});

const CHAVE = "nirvana:categorias";

function NirvanaPage() {
  const [categorias, setCategorias] = useState<Categoria[]>(categoriasIniciais);
  const [ativa, setAtiva] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [carregado, setCarregado] = useState(false);

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

  const atualizarCategoria = (
    id: string,
    fn: (categoria: Categoria) => Categoria,
  ) => setCategorias((atual) => atual.map((c) => (c.id === id ? fn(c) : c)));

  const criarCategoria = (e: React.FormEvent) => {
    e.preventDefault();
    const nome = novoNome.trim();
    if (!nome) return;
    setCategorias((atual) => [...atual, { id: criarId(), nome, itens: [] }]);
    setNovoNome("");
    setModalAberto(false);
  };

  const categoriaAtiva = categorias.find((c) => c.id === ativa) ?? null;

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <ListChecks className="size-5" />
            <span className="font-display text-lg font-semibold tracking-tight">
              Nirvana
            </span>
          </div>
          <span className="text-xs uppercase tracking-[0.18em] text-primary-foreground/60">
            Suas listas
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        {categoriaAtiva ? (
          <ListaView
            categoria={categoriaAtiva}
            onVoltar={() => setAtiva(null)}
            onAdicionarItem={(texto) =>
              atualizarCategoria(categoriaAtiva.id, (c) => ({
                ...c,
                itens: [...c.itens, { id: criarId(), texto, concluido: false }],
              }))
            }
            onAlternarItem={(itemId) =>
              atualizarCategoria(categoriaAtiva.id, (c) => ({
                ...c,
                itens: c.itens.map((i) =>
                  i.id === itemId ? { ...i, concluido: !i.concluido } : i,
                ),
              }))
            }
            onRemoverItem={(itemId) =>
              atualizarCategoria(categoriaAtiva.id, (c) => ({
                ...c,
                itens: c.itens.filter((i) => i.id !== itemId),
              }))
            }
          />
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-semibold tracking-tight">
                  Categorias
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Escolha uma categoria para ver e organizar seus itens.
                </p>
              </div>
              <Button size="lg" onClick={() => setModalAberto(true)}>
                <Plus className="size-4" />
                Criar Categoria
              </Button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categorias.map((categoria) => {
                const pendentes = categoria.itens.filter(
                  (i) => !i.concluido,
                ).length;
                return (
                  <button
                    key={categoria.id}
                    onClick={() => setAtiva(categoria.id)}
                    className="group flex items-center justify-between rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-foreground/40 hover:bg-secondary"
                  >
                    <span>
                      <span className="block font-medium tracking-tight">
                        {categoria.nome}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {categoria.itens.length === 0
                          ? "Lista vazia"
                          : `${pendentes} pendente${pendentes === 1 ? "" : "s"} · ${categoria.itens.length} ${
                              categoria.itens.length === 1 ? "item" : "itens"
                            }`}
                      </span>
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Categoria</DialogTitle>
            <DialogDescription>
              Dê um nome para a sua nova lista.
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
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalAberto(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Criar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
