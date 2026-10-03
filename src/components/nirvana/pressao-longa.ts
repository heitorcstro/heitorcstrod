import type { KeyboardEvent, MouseEvent, PointerEvent } from "react";

export const TEMPO_PRESSAO_BOTAO = 300;

let temporizador: ReturnType<typeof setTimeout> | null = null;
let inicio: { x: number; y: number } | null = null;

const cancelar = () => {
  if (temporizador) {
    clearTimeout(temporizador);
    temporizador = null;
  }
};

/**
 * Handlers de pressão longa. Soltar, sair ou cancelar antes do tempo
 * aborta a ação. Clique instantâneo é ignorado. Teclado (Enter/Espaço) aciona direto.
 * O atraso é configurável por botão (padrão 300ms).
 */
export function pressaoLonga(
  acao: () => void,
  opcoes?: { prevenirPadrao?: boolean; atraso?: number },
) {
  const atraso = opcoes?.atraso ?? TEMPO_PRESSAO_BOTAO;
  return {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      e.stopPropagation();
      if (opcoes?.prevenirPadrao) e.preventDefault();
      if (e.button !== 0) return;
      cancelar();
      inicio = { x: e.clientX, y: e.clientY };
      temporizador = setTimeout(() => {
        temporizador = null;
        acao();
      }, atraso);
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (!inicio) return;
      if (Math.abs(e.clientX - inicio.x) > 8 || Math.abs(e.clientY - inicio.y) > 8) cancelar();
    },
    onPointerUp: cancelar,
    onPointerLeave: cancelar,
    onPointerCancel: cancelar,
    onContextMenu: (e: MouseEvent<HTMLElement>) => e.preventDefault(),
    onClick: (e: MouseEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
    },
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        acao();
      }
    },
  };
}

export const FEEDBACK_PRESSAO = "select-none touch-manipulation transition-transform active:scale-95 active:opacity-75";
