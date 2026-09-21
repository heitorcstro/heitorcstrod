import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { PRIORIDADES, ROTULOS_PRIORIDADE, type Prioridade } from "./types";

type Props = {
  prioridade: Prioridade | null;
  onSelecionar: (prioridade: Prioridade) => void;
  onTransferir: () => void;
};

export function SeletorPrioridade({
  prioridade,
  onSelecionar,
  onTransferir,
}: Props) {
  const [aberto, setAberto] = useState(false);

  const escolher = (opcao: Prioridade | "T") => {
    setAberto(false);
    if (opcao === "T") onTransferir();
    else onSelecionar(opcao);
  };

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={
            prioridade
              ? `Prioridade atual: ${ROTULOS_PRIORIDADE[prioridade]}. Alterar`
              : "Definir prioridade"
          }
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors",
            prioridade
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground",
          )}
        >
          {prioridade ?? ""}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-44 p-1">
        <p className="px-2 py-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Prioridade
        </p>
        {PRIORIDADES.map((opcao) => (
          <button
            key={opcao}
            type="button"
            onClick={() => escolher(opcao)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-secondary",
              prioridade === opcao && "bg-secondary font-medium",
            )}
          >
            <span className="flex size-5 items-center justify-center rounded-full border border-border text-[11px] font-semibold">
              {opcao}
            </span>
            {ROTULOS_PRIORIDADE[opcao]}
          </button>
        ))}
        <div className="my-1 h-px bg-border" />
        <button
          type="button"
          onClick={() => escolher("T")}
          className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-secondary"
        >
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
            T
          </span>
          Transferir
        </button>
      </PopoverContent>
    </Popover>
  );
}
