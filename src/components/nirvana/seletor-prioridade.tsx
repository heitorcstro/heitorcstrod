import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PRIORIDADES, ROTULOS_PRIORIDADE, type Prioridade } from "./types";

type Props = {
  prioridade: Prioridade | null;
  onSelecionar: (prioridade: Prioridade) => void;
  onTransferir: () => void;
};

export function SeletorPrioridade({ prioridade, onSelecionar, onTransferir }: Props) {
  const avancar = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const indiceAtual = prioridade ? PRIORIDADES.indexOf(prioridade) : -1;
    const proxima = PRIORIDADES[(indiceAtual + 1) % PRIORIDADES.length] ?? "1";
    onSelecionar(proxima);
    if (proxima === "T") onTransferir();
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={avancar}
      aria-label={
        prioridade
          ? `Prioridade atual: ${ROTULOS_PRIORIDADE[prioridade]}. Avançar prioridade`
          : "Definir prioridade 1"
      }
      className={cn(
        "size-6 shrink-0 rounded text-xs font-bold text-white shadow-none transition-colors hover:text-white",
        prioridade === "1" && "bg-green-500 hover:bg-green-500",
        prioridade === "2" && "bg-yellow-500 hover:bg-yellow-500",
        prioridade === "3" && "bg-purple-500 hover:bg-purple-500",
        prioridade === "D" && "bg-orange-500 hover:bg-orange-500",
        prioridade === "T" && "bg-red-500 hover:bg-red-500",
        prioridade === null &&
          "border border-border bg-background text-muted-foreground hover:bg-background hover:text-foreground",
      )}
    >
      {prioridade ?? ""}
    </Button>
  );
}
