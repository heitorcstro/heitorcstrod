import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ROTULOS_PRIORIDADE, type Item, type Prioridade } from "./types";

type Props = {
  item: Item;
  onDefinirPrioridade: (prioridade: Prioridade | null) => void;
  onTransferir: () => void;
  onAlternarConclusao: () => void;
  className?: string;
  children: ReactNode;
};

const TEMPO_PRESSAO_LONGA = 2_000;

/**
 * Ciclo completo de prioridades, incluindo o estado inicial (sem prioridade).
 * null -> 1 -> 2 -> 3 -> D -> T -> null
 */
const CICLO: (Prioridade | null)[] = [null, "1", "2", "3", "D", "T"];

/** A única coisa que muda é a COR DO TEXTO; o fundo permanece branco. */
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
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ignorarProximoClique = useRef(false);

  const cancelarTemporizador = () => {
    if (temporizador.current) {
      clearTimeout(temporizador.current);
      temporizador.current = null;
    }
  };

  useEffect(() => cancelarTemporizador, []);

  const iniciarPressao = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    cancelarTemporizador();
    ignorarProximoClique.current = false;
    temporizador.current = setTimeout(() => {
      ignorarProximoClique.current = true;
      temporizador.current = null;
      onAlternarConclusao();
    }, TEMPO_PRESSAO_LONGA);
  };

  const avancarPrioridade = () => {
    if (ignorarProximoClique.current) {
      ignorarProximoClique.current = false;
      return;
    }
    const indiceAtual = item.prioridade ? CICLO.indexOf(item.prioridade) : 0;
    const proximo = CICLO[(indiceAtual + 1) % CICLO.length] ?? null;
    onDefinirPrioridade(proximo);
    if (proximo === "T") onTransferir();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${item.texto}. ${
        item.prioridade ? ROTULOS_PRIORIDADE[item.prioridade] : "Sem prioridade"
      }. Toque para mudar a prioridade; pressione por dois segundos para ${
        item.concluido ? "desmarcar" : "marcar como feito"
      }.`}
      onPointerDown={iniciarPressao}
      onPointerUp={cancelarTemporizador}
      onPointerLeave={cancelarTemporizador}
      onPointerCancel={cancelarTemporizador}
      onClick={avancarPrioridade}
      onContextMenu={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          avancarPrioridade();
        }
      }}
      className={cn(
        "cursor-pointer select-none bg-transparent text-gray-900 transition-colors",
        item.prioridade ? corDaPrioridade[item.prioridade] : "text-gray-900",
        className,
      )}
    >
      {children}
    </div>
  );
}
