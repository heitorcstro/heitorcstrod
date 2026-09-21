import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { ItemOrdenavel, ListaOrdenavel } from "./dnd";
import { ESTILOS_COR_CATEGORIA } from "./cores-categoria";
import { cn } from "@/lib/utils";
import type { Categoria } from "./types";

type Props = {
  categorias: Categoria[];
  onCriarCategoria: () => void;
  onDeletarCategoria?: () => void;
  onSelecionarCategoria: (categoriaId: string) => void;
  onReordenarCategorias: (ativoId: string, sobreId: string) => void;
  onAbrirArquivados?: () => void;
  totalArquivados?: number;
  expandido?: boolean;
  onAlternarExpansao?: () => void;
};

export function SidebarCategorias({
  categorias,
  onCriarCategoria,
  onDeletarCategoria,
  onSelecionarCategoria,
  onReordenarCategorias,
  onAbrirArquivados,
  totalArquivados = 0,
  expandido = true,
  onAlternarExpansao,
}: Props) {
  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col overflow-hidden border-r border-black bg-white transition-all duration-300 ease-in-out",
        expandido ? "w-72" : "w-16",
      )}
    >
      <div className="relative flex flex-row items-center justify-between gap-2 border-b border-black px-3 py-4">
        {expandido && (
          <span className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-black">
            Categorias
          </span>
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
          <div className="mb-2 border-b-4 border-gray-100">
            <div
              role="button"
              tabIndex={0}
              onClick={onCriarCategoria}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onCriarCategoria();
              }}
              className="flex cursor-pointer flex-row items-center gap-3 border-b border-gray-200 px-4 py-3 text-black hover:bg-slate-100"
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
              className="group flex cursor-pointer flex-row items-center gap-3 border-b border-gray-200 px-4 py-3 text-black hover:bg-slate-100"
            >
              <Trash2
                className="size-[18px] shrink-0 text-gray-500 transition-colors group-hover:text-red-500"
                strokeWidth={2.5}
              />
              <span className="text-sm font-medium">Deletar Categoria</span>
            </div>
          </div>
        ) : null}
        {expandido ? (
          <ListaOrdenavel
            id="sidebar-categorias"
            ids={categorias.map((c) => c.id)}
            onReordenar={onReordenarCategorias}
          >
            {categorias.map((categoria) => (
              <ItemOrdenavel
                key={categoria.id}
                id={categoria.id}
                textoAlca="Mover essa Categoria"
                alcaLetra="M"
                inline
              >
                {(alca) => (
                  <div className="flex flex-row items-center justify-between gap-2 border-b border-gray-200 px-4 py-3 text-black">
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
            ))}
          </ListaOrdenavel>
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
