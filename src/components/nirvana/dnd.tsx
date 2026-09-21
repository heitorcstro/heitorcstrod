import type { ReactNode } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ListaProps = {
  /** Identificador estável: evita divergência de ids entre servidor e cliente. */
  id: string;
  ids: string[];
  onReordenar: (ativoId: string, sobreId: string) => void;
  children: ReactNode;
};

/** Contexto de arrastar-e-soltar com suporte a toque (mobile) e teclado. */
export function ListaOrdenavel({ id, ids, onReordenar, children }: ListaProps) {
  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const aoSoltar = (evento: DragEndEvent) => {
    const { active, over } = evento;
    if (!over || active.id === over.id) return;
    onReordenar(String(active.id), String(over.id));
  };

  return (
    <DndContext sensors={sensores} collisionDetection={closestCenter} onDragEnd={aoSoltar}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

type ItemProps = {
  id: string;
  textoAlca:
    | "Mover categoria"
    | "Mover subcategoria"
    | "Mover item"
    | "Mover essa Categoria";
  className?: string;
  /**
   * Quando verdadeiro, renderiza a alça como um texto sutil embutido ao lado
   * do título (em vez de um botão destacado). Usado para categorias e
   * subcategorias.
   */
  inline?: boolean;
  /**
   * Quando informado, renderiza a alça inline como um pequeno quadrado com
   * esta letra/ símbolo (em vez do texto completo). O `textoAlca` é usado
   * apenas como rótulo acessível (aria-label).
   */
  alcaLetra?: string;
  /**
   * Classes opcionais para sobrescrever o estilo padrão da alça inline
   * (apenas quando `alcaLetra` não é informado).
   */
  alcaClassName?: string;
  children: (alca: ReactNode) => ReactNode;
};

/** Item reordenável: expõe a alça de arraste para o conteúdo. */
export function ItemOrdenavel({
  id,
  textoAlca,
  className,
  inline = false,
  alcaLetra,
  alcaClassName,
  children,
}: ItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const alca = inline ? (
    <span
      ref={setActivatorNodeRef}
      suppressHydrationWarning
      {...attributes}
      {...listeners}
      aria-label={textoAlca}
      tabIndex={0}
      className={
        alcaLetra
          ? "ml-auto inline-flex size-8 shrink-0 cursor-grab touch-none select-none items-center justify-center rounded-md border border-black bg-white p-0 text-sm font-medium text-black transition-colors hover:bg-black/5 active:cursor-grabbing"
          : alcaClassName ??
            "ml-auto inline-flex shrink-0 cursor-grab touch-none select-none items-center rounded-md border border-black bg-white px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-black/5 active:cursor-grabbing"
      }
    >
      {alcaLetra ?? textoAlca}
    </span>
  ) : (
    <Button
      type="button"
      variant="outline"
      size="sm"
      suppressHydrationWarning
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label={textoAlca}
      className="h-8 shrink-0 cursor-grab touch-none px-2 text-xs text-foreground active:cursor-grabbing"
    >
      {textoAlca}
    </Button>
  );

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(className, isDragging && "relative z-20 opacity-80")}
    >
      {children(alca)}
    </div>
  );
}
