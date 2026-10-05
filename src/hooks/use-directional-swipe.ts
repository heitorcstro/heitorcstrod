import { useCallback, useRef, useState } from "react";

type Props = {
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  threshold?: number;
};

const IGNORAR = '[data-control="Puma"], [data-control="Beco"], [data-control="Cais"]';

export function useDirectionalSwipe({ onSwipeRight, onSwipeLeft, threshold = 55 }: Props) {
  const [offsetX, setOffsetX] = useState(0);
  const inicio = useRef<{ x: number; y: number } | null>(null);
  const horizontal = useRef<boolean | null>(null);
  const offsetRef = useRef(0);
  const houveSwipe = useRef(false);

  const reset = useCallback(() => {
    inicio.current = null;
    horizontal.current = null;
    offsetRef.current = 0;
    setOffsetX(0);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== undefined && e.button !== 0) return;
    if ((e.target as HTMLElement).closest(IGNORAR)) return;
    inicio.current = { x: e.clientX, y: e.clientY };
    horizontal.current = null;
    houveSwipe.current = false;
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!inicio.current) return;
      const dx = e.clientX - inicio.current.x;
      const dy = e.clientY - inicio.current.y;
      if (horizontal.current === null) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          reset();
          return;
        }
        horizontal.current = true;
        houveSwipe.current = true;
      }
      const c = Math.max(0, Math.min(72, dx));
      offsetRef.current = c;
      setOffsetX(c);
    },
    [reset],
  );

  const onPointerUp = useCallback(() => {
    if (horizontal.current) {
      const o = offsetRef.current;
      if (o >= threshold) {
        onSwipeRight();
        navigator.vibrate?.(15);
      } else if (o <= -threshold) {
        onSwipeLeft();
        navigator.vibrate?.(15);
      }
    }
    reset();
  }, [threshold, onSwipeRight, onSwipeLeft, reset]);

  /** Retorna true (uma vez) se o último gesto foi um swipe — para suprimir o clique. */
  const consumirSwipe = useCallback(() => {
    const v = houveSwipe.current;
    houveSwipe.current = false;
    return v;
  }, []);

  return {
    offsetX,
    consumirSwipe,
    swipeHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: reset,
      onPointerLeave: onPointerUp,
    },
  };
}
