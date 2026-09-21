import { useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Folder,
  Plus,
  Trash2,
} from "lucide-react";
import { AreaSoltavel, ContextoArrasto, ItemOrdenavel } from "./dnd";
import { ESTILOS_COR_CATEGORIA } from "./cores-categoria";
import { cn } from "@/lib/utils";
import type { Categoria, Pasta } from "./types";

type Props = {
  categorias: Categoria[];
  pastas?: Pasta[];
  onCriarPasta?: () => void;
  onDeletarPasta?: () => void;
  onMoverCategoriaParaPasta?: (categoriaId: string, pastaId: string | null) => void;
  onCriarCategoria: () => void;
  onDeletarCategoria?: () => void;
  onSelecionarCategoria: (categoriaId: string) => void;
  onReordenarCategorias: (ativoId: string, sobreId: string) => void;
  onAbrirArquivados?: () => void;
  totalArquivados?: number;
  expandido?: boolean;
  onAlternarExpansao?: () => void;
};

const CLASSE_ACAO =
  "flex cursor-pointer flex-row items-center gap-3 border-b border-gray-200 px-4 py-3 text-black hover:bg-slate-100";

export function SidebarCategorias({
  categorias,
  pastas = [],
  onCriarPasta,
  onDeletarPasta,
  onMoverCategoriaParaPasta,
  onCriarCategoria,
  onDeletarCategoria,
  onSelecionarCategoria,
  onReordenarCategorias,
  onAbrirArquivados,
  totalArquivados = 0,
  expandido = true,
  onAlternarExpansao,
}: Props) {
  const [pastasAbertas, setPastasAbertas] = useState<string[]>([]);

  const alternarPasta = (pastaId: string) =>
    setPastasAbertas((atual) =>
      atual.includes(pastaId) ? atual.filter((id) => id !== pastaId) : [...atual, pastaId],
    );

  const categoriasSoltas = categorias.filter((c) => !c.pastaId);
  const categoriasDaPasta = (pastaId: string) =>
    categorias.filter((c) => c.pastaId === pastaId);

  const aoSoltar = (ativoId: string, sobreId: string) => {
    if (sobreId.startsWith("pasta:")) {
      onMoverCategoriaParaPasta?.(ativoId, sobreId.slice("pasta:".length));
      return;
    }
    if (sobreId === "raiz") {
      onMoverCategoriaParaPasta?.(ativoId, null);
      return;
    }
    onReordenarCategorias(ativoId, sobreId);
  };

  const linhaCategoria = (categoria: Categoria, dentroDePasta = false) => (
    <ItemOrdenavel
      key={categoria.id}
      id={categoria.id}
      textoAlca="Mover essa Categoria"
      alcaLetra="M"
      inline
    >
      {(alca) => (
        <div
          className={cn(
            "flex flex-row items-center justify-between gap-2 border-b border-gray-200 px-4 py-3 text-black",
            dentroDePasta && "bg-slate-50 pl-9",
          )}
        >
          <button
            type="button"
            onClick={() => onSelecionarCategoria(categoria.id)}
            className="flex min-w-0 flex-1 items-center gap-2 pr-3 text-left"
          >
            <span
              className={`size-3 shrink-0 rounded-sm border border-black ${ESTILOS_COR_CATEGORIA[categoria.cor].fundo}`}
            />
            <span className="whitespace-normal break-words text-sm font-medium">
              {categoria.nome}
            </span>
          </button>
          {alca}
        </div>
      )}
    </ItemOrdenavel>
  );

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col overflow-hidden border-r border-black bg-white transition-all duration-300 ease-in-out",
        expandido ? "w-72" : "w-16",
      )}
    >
      <div className="relative flex flex-row items-center justify-between gap-2 border-b border-black px-3 py-4">
        {expandido && (
          <div className="flex min-w-0 flex-row items-center gap-3">
            <svg
              viewBox="0 0 40 40"
              xmlns="http://www.w3.org/2000/svg"
              className="size-10 shrink-0 rounded-md shadow-sm"
              role="img"
              aria-label="Nirvana"
            >
              <rect width="40" height="40" rx="9" fill="#FFFFFF" />
              <path d="M8 8H14V22L26 8H32V32H26V18L14 32H8Z" fill="url(#nirvana-n-grad-sidebar)" />
              <defs>
                <linearGradient
                  id="nirvana-n-grad-sidebar"
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
            <span className="font-display text-lg font-semibold tracking-tight text-black">
              Nirvana
            </span>
          </div>
        )}
        {expandido ? (
          <button
            type="button"
            onClick={onAlternarExpansao}
            aria-label="Recolher"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-black bg-white text-black transition-colors hover:bg-black/5"
          >
            <ChevronLeft className="size-[18px]" strokeWidth={2.5} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onAlternarExpansao}
            aria-label="Expandir"
            className="mx-auto flex h-8 w-8 items-center justify-center rounded-md border border-black bg-white text-black transition-colors hover:bg-black/5"
          >
            <ChevronRight className="size-[18px]" strokeWidth={2.5} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {expandido ? (
          <>
            {/* Seção 1: Pastas */}
            <div className="px-4 pt-6 pb-2 text-xs font-bold text-gray-500 tracking-wider">
              PASTAS
            </div>
            <div>
              <div
                role="button"
                tabIndex={0}
                onClick={onCriarPasta}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onCriarPasta?.();
                }}
                className={CLASSE_ACAO}
              >
                <Plus className="size-[18px] shrink-0" strokeWidth={2.5} />
                <span className="text-sm font-medium">Criar Pasta</span>
              </div>
              <div
                role="button"
                tabIndex={0}
                onClick={onDeletarPasta}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onDeletarPasta?.();
                }}
                className={cn(CLASSE_ACAO, "group")}
              >
                <Trash2
                  className="size-[18px] shrink-0 text-gray-500 transition-colors group-hover:text-red-500"
                  strokeWidth={2.5}
                />
                <span className="text-sm font-medium">Deletar Pasta</span>
              </div>
            </div>

            <ContextoArrasto ids={categorias.map((c) => c.id)} onSoltar={aoSoltar}>
              {pastas.map((pasta) => {
                const aberta = pastasAbertas.includes(pasta.id);
                const dentro = categoriasDaPasta(pasta.id);
                return (
                  <AreaSoltavel
                    key={pasta.id}
                    id={`pasta:${pasta.id}`}
                    classNameAtiva="bg-blue-50 ring-2 ring-inset ring-blue-500"
                  >
                    <button
                      type="button"
                      onClick={() => alternarPasta(pasta.id)}
                      className="flex w-full flex-row items-center gap-3 border-b border-gray-200 px-4 py-3 text-left text-black hover:bg-slate-100"
                    >
                      <Folder
                        className={cn(
                          "size-[18px] shrink-0",
                          ESTILOS_COR_CATEGORIA[pasta.cor]?.texto,
                        )}
                        strokeWidth={2.5}
                        fill="currentColor"
                      />

                      <span className="min-w-0 flex-1 whitespace-normal break-words text-sm font-medium">
                        {pasta.nome}
                      </span>
                      <span className="shrink-0 text-xs text-black/60">{dentro.length}</span>
                      <ChevronDown
                        className={cn(
                          "size-[18px] shrink-0 transition-transform duration-200",
                          aberta && "rotate-180",
                        )}
                        strokeWidth={2.5}
                      />
                    </button>
                    {aberta && dentro.length > 0
                      ? dentro.map((categoria) => linhaCategoria(categoria, true))
                      : null}
                    {aberta && dentro.length === 0 ? (
                      <p className="border-b border-gray-200 bg-slate-50 px-4 py-3 pl-9 text-xs text-black/50">
                        Arraste uma categoria para cá.
                      </p>
                    ) : null}
                  </AreaSoltavel>
                );
              })}

              {/* Seção 2: Categorias */}
              <div className="px-4 pt-6 pb-2 text-xs font-bold text-gray-500 tracking-wider">
                CATEGORIAS
              </div>
              <div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={onCriarCategoria}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") onCriarCategoria();
                  }}
                  className={CLASSE_ACAO}
                >
                  <Plus className="size-[18px] shrink-0" strokeWidth={2.5} />
                  <span className="text-sm font-medium">Criar Categoria</span>
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={onDeletarCategoria}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") onDeletarCategoria?.();
                  }}
                  className={cn(CLASSE_ACAO, "group")}
                >
                  <Trash2
                    className="size-[18px] shrink-0 text-gray-500 transition-colors group-hover:text-red-500"
                    strokeWidth={2.5}
                  />
                  <span className="text-sm font-medium">Deletar Categoria</span>
                </div>
              </div>

              <AreaSoltavel id="raiz" classNameAtiva="bg-blue-50">
                {categoriasSoltas.map((categoria) => linhaCategoria(categoria))}
              </AreaSoltavel>
            </ContextoArrasto>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 px-3 py-3">
            {categorias.map((categoria) => (
              <button
                key={categoria.id}
                type="button"
                onClick={() => onSelecionarCategoria(categoria.id)}
                aria-label={categoria.nome}
                className="flex items-center justify-center"
              >
                <span
                  className={`size-4 shrink-0 rounded-sm border border-black ${ESTILOS_COR_CATEGORIA[categoria.cor].fundo}`}
                />
              </button>
            ))}
          </div>
        )}

        {/* Seção 3: Arquivados */}
        <button
          type="button"
          onClick={onAbrirArquivados}
          className={cn(
            "flex w-full flex-row items-center justify-between gap-2 border-b border-gray-200 px-4 py-3 text-left text-black transition-colors hover:bg-black/5",
            !expandido && "justify-center px-0",
          )}
        >
          <span className="whitespace-normal break-words text-sm font-medium">
            {expandido ? "Arquivados" : "📦"}
          </span>
          {expandido && totalArquivados > 0 && (
            <span className="shrink-0 text-xs text-black/60">{totalArquivados}</span>
          )}
        </button>
      </div>
    </aside>
  );
}
