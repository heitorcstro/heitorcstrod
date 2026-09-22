import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PRIORIDADES, ROTULOS_PRIORIDADE, type Item, type Prioridade } from "./types";

type Props = {
  item: Item;
  onDefinirPrioridade: (prioridade: Prioridade) => void;
  onTransferir: () => void;
  onAlternarConclusao: () => void;
  className?: string;
  children: ReactNode;
};

const TEMPO_PRESSAO_LONGA = 2_000;

const corDaPrioridade: Record<Prioridade, string> = {
  "1": "bg-green-500 text-white hover:bg-green-500",
  "2": "bg-yellow-500 text-black hover:bg-yellow-500",
  "3": "bg-purple-500 text-white hover:bg-purple-500",
  D: "bg-orange-500 text-white hover:bg-orange-500",
  T: "bg-red-500 text-white hover:bg-red-500",
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
    const indiceAtual = item.prioridade ? PRIORIDADES.indexOf(item.prioridade) : -1;
    const proxima = PRIORIDADES[(indiceAtual + 1) % PRIORIDADES.length] ?? "1";
    onDefinirPrioridade(proxima);
    if (proxima === "T") onTransferir();
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
        "cursor-pointer select-none transition-colors",
        item.prioridade ? corDaPrioridade[item.prioridade] : "bg-card text-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}