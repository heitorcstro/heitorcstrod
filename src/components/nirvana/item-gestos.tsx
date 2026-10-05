import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useDirectionalSwipe } from "@/hooks/use-directional-swipe";
import { ROTULOS_PRIORIDADE, type Item, type Prioridade } from "./types";

type Props = {
  item: Item;
  onDefinirPrioridade: (prioridade: Prioridade | null) => void;
  onTransferir: () => void;
  onAlternarConclusao: () => void;
  className?: string;
  children: ReactNode;
};

/** null -> 1 -> 2 -> 3 -> D -> T -> null */
const CICLO: (Prioridade | null)[] = [null, "1", "2", "3", "D", "T"];

const corDaPrioridade: Record<Prioridade, string> = {
  "1": "text-green-600",
  "2": "text-yellow-500",
  "3": "text-purple-600",
  D: "text-orange-500",
  T: "text-red-600",
};

export function ItemGestos({
  item,
  onDefinirPrioridade,
  onTransferir,
  onAlternarConclusao,
  className,
  children,
}: Props) {
  const { offsetX, consumirSwipe, swipeHandlers } = useDirectionalSwipe({
    onSwipeRight: onAlternarConclusao,
    onSwipeLeft: () => {},
  });

  const avancarPrioridade = () => {
    if (consumirSwipe()) return;
    const indiceAtual = item.prioridade ? CICLO.indexOf(item.prioridade) : 0;
    const proximo = CICLO[(indiceAtual + 1) % CICLO.length] ?? null;
    onDefinirPrioridade(proximo);
    if (proximo === "T") onTransferir();
  };

  const tint =
    offsetX > 25 ? (item.concluido ? "bg-amber-50/80" : "bg-emerald-50/80") : "bg-transparent";

  return (
    <div
      role="button"
      data-control="Orla"
      tabIndex={0}
      aria-label={`${item.texto}. ${
        item.prioridade ? ROTULOS_PRIORIDADE[item.prioridade] : "Sem prioridade"
      }. Toque para mudar a prioridade; deslize para a direita para ${item.concluido ? "desmarcar" : "marcar como feito"}.`}
      {...swipeHandlers}
      onClick={avancarPrioridade}
      onContextMenu={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          avancarPrioridade();
        }
      }}
      style={{
        transform: `translateX(${offsetX}px)`,
        transition: offsetX === 0 ? "transform 150ms ease-out" : "none",
        touchAction: "pan-y",
      }}
      className={cn(
        "cursor-pointer select-none rounded text-gray-900 transition-colors",
        tint,
        item.prioridade ? corDaPrioridade[item.prioridade] : "text-gray-900",
        className,
      )}
    >
      {children}
    </div>
  );
}
