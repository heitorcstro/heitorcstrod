import type { KeyboardEvent, MouseEvent, PointerEvent } from "react";

export const TEMPO_PRESSAO_BOTAO = 300;

let temporizador: ReturnType<typeof setTimeout> | null = null;

const cancelar = () => {
  if (temporizador) {
    clearTimeout(temporizador);
    temporizador = null;
  }
};

/**
 * Handlers de pressão longa (300ms). Soltar, sair ou cancelar antes do tempo
 * aborta a ação. Clique instantâneo é ignorado. Teclado (Enter/Espaço) aciona direto.
 */
export function pressaoLonga(acao: () => void, opcoes?: { prevenirPadrao?: boolean }) {
  return {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      e.stopPropagation();
      if (opcoes?.prevenirPadrao) e.preventDefault();
      if (e.button !== 0) return;
      cancelar();
      temporizador = setTimeout(() => {
        temporizador = null;
        acao();
      }, TEMPO_PRESSAO_BOTAO);
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
