import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  CORES_CATEGORIA,
  ROTULOS_COR_CATEGORIA,
  type CorCategoria,
} from "./types";

type EstiloCorCategoria = {
  indicador: string;
  texto: string;
  anel: string;
  /** Fundo sólido usado no cartão da categoria (contraste com texto branco). */
  fundo: string;
};

export const ESTILOS_COR_CATEGORIA: Record<CorCategoria, EstiloCorCategoria> = {
  Red: {
    indicador: "bg-red-600",
    texto: "text-red-600",
    anel: "ring-red-600",
    fundo: "bg-red-600",
  },
  Green: {
    indicador: "bg-green-600",
    texto: "text-green-700",
    anel: "ring-green-600",
    fundo: "bg-green-600",
  },
  Blue: {
    indicador: "bg-blue-700",
    texto: "text-blue-700",
    anel: "ring-blue-700",
    fundo: "bg-blue-700",
  },
  Purple: {
    indicador: "bg-purple-600",
    texto: "text-purple-700",
    anel: "ring-purple-600",
    fundo: "bg-purple-600",
  },
  Yellow: {
    indicador: "bg-yellow-400",
    texto: "text-yellow-700",
    anel: "ring-yellow-500",
    fundo: "bg-yellow-500",
  },
  Orange: {
    indicador: "bg-orange-500",
    texto: "text-orange-700",
    anel: "ring-orange-500",
    fundo: "bg-orange-500",
  },
  Magenta: {
    indicador: "bg-fuchsia-600",
    texto: "text-fuchsia-700",
    anel: "ring-fuchsia-600",
    fundo: "bg-fuchsia-600",
  },
  Gold: {
    indicador: "bg-amber-500",
    texto: "text-amber-700",
    anel: "ring-amber-500",
    fundo: "bg-amber-500",
  },
};

export const estiloBotaoCorCategoria =
  "inline-flex shrink-0 select-none items-center rounded-md border border-black bg-white px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-black/5";

export function IndicadorCorCategoria({
  cor,
  className,
}: {
  cor: CorCategoria;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-3.5 shrink-0 rounded-full border border-black",
        ESTILOS_COR_CATEGORIA[cor].indicador,
        className,
      )}
    />
  );
}

export function NomeCategoriaColorido({
  cor,
  children,
  className,
}: {
  cor: CorCategoria;
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn(ESTILOS_COR_CATEGORIA[cor].texto, className)}>{children}</span>;
}

export function GradeCoresCategoria({
  selecionada,
  onSelecionar,
}: {
  selecionada: CorCategoria | null;
  onSelecionar: (cor: CorCategoria) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {CORES_CATEGORIA.map((cor) => {
        const selecionadaAtual = selecionada === cor;
        return (
          <Button
            key={cor}
            type="button"
            variant="outline"
            aria-pressed={selecionadaAtual}
            onClick={() => onSelecionar(cor)}
            className={cn(
              "h-auto justify-start gap-2 border-black bg-white px-3 py-2 text-sm font-medium text-black hover:bg-black/5",
              selecionadaAtual && "ring-2 ring-offset-2",
              selecionadaAtual && ESTILOS_COR_CATEGORIA[cor].anel,
            )}
          >
            <IndicadorCorCategoria cor={cor} />
            {ROTULOS_COR_CATEGORIA[cor]}
          </Button>
        );
      })}
    </div>
  );
}

export function TrocarCorCategoria({
  corAtual,
  onSelecionar,
}: {
  corAtual: CorCategoria;
  onSelecionar: (cor: CorCategoria) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={estiloBotaoCorCategoria}>
          Trocar de cor
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        {CORES_CATEGORIA.map((cor) => (
          <DropdownMenuItem
            key={cor}
            onSelect={() => onSelecionar(cor)}
            className="gap-2"
          >
            <IndicadorCorCategoria cor={cor} />
            <span className="flex-1">{ROTULOS_COR_CATEGORIA[cor]}</span>
            {corAtual === cor && <span className="text-xs text-muted-foreground">Atual</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}