import type { ReactNode } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  pointerWithin,
  useDndContext,
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

/** Tipos permitidos no arrasto da hierarquia. */
export type TipoArrasto = "pasta" | "categoria";

type ContextoProps = {
  ids: string[];
  /** Recebe o id arrastado e o id do alvo (pode ser uma área soltável). */
  onSoltar: (ativoId: string, sobreId: string) => void;
  children: ReactNode;
};

const tipoDe = (dados: unknown): TipoArrasto | null => {
  const tipo = (dados as { tipo?: unknown } | null)?.tipo;
  return tipo === "pasta" || tipo === "categoria" ? tipo : null;
};

/** Alvos válidos para cada tipo arrastado. */
const alvoValido = (tipoAtivo: TipoArrasto | null, tipoAlvo: TipoArrasto | null) => {
  if (tipoAtivo === "pasta") return tipoAlvo === "pasta";
  if (tipoAtivo === "categoria") return tipoAlvo === "categoria" || tipoAlvo === "pasta";
  return false;
};

/**
 * Contexto de arrasto que aceita tanto reordenação (itens ordenáveis) quanto
 * soltar dentro de áreas (pastas), respeitando os tipos permitidos.
 */
export function ContextoArrasto({ ids, onSoltar, children }: ContextoProps) {
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
    // Rejeita combinações inválidas (ex.: pasta solta na lista de categorias).
    if (!alvoValido(tipoDe(active.data.current), tipoDe(over.data.current))) return;
    onSoltar(String(active.id), String(over.id));
  };

  /**
   * O ponteiro manda: garante que soltar sobre uma pasta use a pasta como
   * alvo, e não o cartão arrastado (que é bem maior que o cursor). Também
   * descarta alvos de tipo incompatível com o que está sendo arrastado.
   */
  const deteccao = (args: Parameters<typeof closestCenter>[0]) => {
    const tipoAtivo = tipoDe(args.active.data.current);
    const permitidos = {
      ...args,
      droppableContainers: args.droppableContainers.filter((container) =>
        alvoValido(tipoAtivo, tipoDe(container.data.current)),
      ),
    };
    const porPonteiro = pointerWithin(permitidos);
    if (porPonteiro.length > 0) return porPonteiro;
    return closestCenter(permitidos);
  };

  return (
    <DndContext sensors={sensores} collisionDetection={deteccao} onDragEnd={aoSoltar}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

type AreaProps = {
  id: string;
  /** Tipo aceito por esta área (usado nas restrições de arrasto). */
  tipo?: TipoArrasto | undefined;
  className?: string;
  classNameAtiva?: string;
  children: ReactNode;
};

/** Área que pode receber itens arrastados (ex.: uma Pasta). */
export function AreaSoltavel({ id, tipo, className, classNameAtiva, children }: AreaProps) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { tipo } });
  return (
    <div ref={setNodeRef} className={cn(className, isOver && classNameAtiva)}>
      {children}
    </div>
  );
}

type ItemProps = {
  id: string;
  /** Tipo arrastado: define quais alvos aceitam este item. */
  tipo?: TipoArrasto | undefined;
  textoAlca:
    | "Mover categoria"
    | "Mover subcategoria"
    | "Mover item"
    | "Mover essa Categoria"
    | "Mover pasta"
    | "Mover essa Pasta";
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
   * Quando informado e `alcaLetra` estiver ausente, renderiza este texto
   * como conteúdo visível da alça (em vez de `textoAlca`). `textoAlca`
   * permanece como rótulo acessível (aria-label).
   */
  alcaTexto?: string;
  /**
   * Classes opcionais para sobrescrever o estilo padrão da alça inline
   * (apenas quando `alcaLetra` não é informado).
   */
  alcaClassName?: string;
  /**
   * Quando verdadeiro, renderiza o ícone PNG (/drag-icon.png) dentro da
   * caixa fixa w-6 h-6, substituindo qualquer texto visível. `textoAlca`
   * permanece como rótulo acessível (aria-label).
   */
  alcaIcone?: boolean;
  /**
   * Classes para sobrescrever as dimensões da caixa do ícone (ex.: "h-8 w-8").
   * Por padrão a caixa é h-6 w-6.
   */
  alcaBoxClassName?: string;
  /**
   * Classes para sobrescrever as dimensões do ícone PNG (ex.: "h-7 w-7").
   * Por padrão o ícone é h-5 w-5 (preto sólido).
   */
  alcaImgClassName?: string;
  children: (alca: ReactNode) => ReactNode;
};

/** Item reordenável: expõe a alça de arraste para o conteúdo. */
export function ItemOrdenavel({
  id,
  tipo,
  textoAlca,
  className,
  inline = false,
  alcaLetra,
  alcaTexto,
  alcaClassName,
  alcaIcone,
  alcaBoxClassName,
  alcaImgClassName,
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
    isOver,
  } = useSortable({ id, data: { tipo } });
  const { active } = useDndContext();
  const tipoAtivo = tipoDe(active?.data.current);
  /**
   * Arrasto entre tipos diferentes (ex.: categoria sobre pasta): o item alvo
   * age apenas como receptáculo estático — nunca desloca nem troca de lugar.
   */
  const alvoEstatico = Boolean(tipo && tipoAtivo && tipoAtivo !== tipo);
  const destacado = alvoEstatico && isOver;

  const alca = inline ? (
    <span
      ref={setActivatorNodeRef}
      suppressHydrationWarning
      {...attributes}
      {...listeners}
      aria-label={textoAlca}
      tabIndex={0}
      className={
        alcaIcone
          ? "group inline-flex h-6 w-6 shrink-0 cursor-grab touch-none select-none items-center justify-center rounded-md border border-black bg-white p-0 transition-colors hover:bg-black/5 active:cursor-grabbing"
          : alcaClassName ??
            (alcaLetra
              ? "inline-flex h-6 w-6 shrink-0 cursor-grab touch-none select-none items-center justify-center rounded-md border border-black bg-white p-0 text-xs font-medium text-black transition-colors hover:bg-black/5 active:cursor-grabbing"
              : "inline-flex shrink-0 cursor-grab touch-none select-none items-center rounded-md border border-black bg-white px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-black/5 active:cursor-grabbing"
            )
      }
    >
      {alcaIcone ? (
        <img
          src="/drag-icon.png"
          alt=""
          draggable={false}
          className="pointer-events-none h-4 w-4 select-none object-contain opacity-60 transition-opacity group-hover:opacity-100"
        />
      ) : (
        (alcaLetra ?? alcaTexto ?? textoAlca)
      )}
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
      style={
        alvoEstatico
          ? undefined
          : {
              transform: CSS.Transform.toString(transform),
              transition,
            }
      }
      className={cn(
        className,
        isDragging && "relative z-20 opacity-80",
        destacado && "rounded-md ring-2 ring-blue-500",
      )}
    >
      {children(alca)}
    </div>
  );
}
