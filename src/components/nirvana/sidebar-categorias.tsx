import { Plus } from "lucide-react";
import { ItemOrdenavel, ListaOrdenavel } from "./dnd";
import { ESTILOS_COR_CATEGORIA } from "./cores-categoria";
import type { Categoria } from "./types";

type Props = {
  categorias: Categoria[];
  onCriarCategoria: () => void;
  onSelecionarCategoria: (categoriaId: string) => void;
  onReordenarCategorias: (ativoId: string, sobreId: string) => void;
  onAbrirArquivados?: () => void;
  totalArquivados?: number;
};

export function SidebarCategorias({
  categorias,
  onCriarCategoria,
  onSelecionarCategoria,
  onReordenarCategorias,
  onAbrirArquivados,
  totalArquivados = 0,
}: Props) {
  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-black bg-white">
      <div className="flex flex-row items-center justify-between border-b border-black px-4 py-4">
        <span className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-black">
          Categorias
        </span>
        <button
          type="button"
          onClick={onCriarCategoria}
          aria-label="Criar Categoria"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-black bg-white text-lg text-black transition-colors hover:bg-black/5"
        >
          <Plus className="size-[18px]" strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
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

        <button
          type="button"
          onClick={onAbrirArquivados}
          className="flex w-full flex-row items-center justify-between gap-2 border-b border-gray-200 px-4 py-3 text-left text-black transition-colors hover:bg-black/5"
        >
          <span className="truncate text-sm font-medium">Arquivados</span>
          {totalArquivados > 0 && (
            <span className="shrink-0 text-xs text-black/60">{totalArquivados}</span>
          )}
        </button>
      </div>
    </aside>
  );
}
