import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Categoria } from "./types";

type Props = {
  aberto: boolean;
  categorias: Categoria[];
  textoItem: string;
  subcategoriaAtual: string | null;
  onFechar: () => void;
  onEscolher: (subcategoriaId: string) => void;
};

export function DialogoTransferir({
  aberto,
  categorias,
  textoItem,
  subcategoriaAtual,
  onFechar,
  onEscolher,
}: Props) {
  const [expandida, setExpandida] = useState<string | null>(null);

  return (
    <Dialog
      open={aberto}
      onOpenChange={(estado) => {
        if (!estado) {
          setExpandida(null);
          onFechar();
        }
      }}
    >
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mover para</DialogTitle>
          <DialogDescription>
            Escolha a subcategoria de destino para “{textoItem}”.
          </DialogDescription>
        </DialogHeader>

        <div className="divide-y divide-border border-y border-border">
          {categorias.map((categoria) => {
            const aberta = expandida === categoria.id;
            return (
              <div key={categoria.id}>
                <button
                  type="button"
                  onClick={() => setExpandida(aberta ? null : categoria.id)}
                  className="flex w-full items-center justify-between gap-2 py-3 text-left text-sm font-medium transition-colors hover:text-primary"
                >
                  {categoria.nome}
                  {aberta ? (
                    <ChevronDown className="size-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="size-4 text-muted-foreground" />
                  )}
                </button>
                {aberta && (
                  <ul className="pb-3">
                    {categoria.subcategorias.map((sub) => (
                      <li key={sub.id}>
                        <button
                          type="button"
                          disabled={sub.id === subcategoriaAtual}
                          onClick={() => {
                            setExpandida(null);
                            onEscolher(sub.id);
                          }}
                          className={cn(
                            "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                            sub.id === subcategoriaAtual
                              ? "cursor-not-allowed text-muted-foreground"
                              : "hover:bg-secondary",
                          )}
                        >
                          {sub.nome}
                          {sub.id === subcategoriaAtual && " (atual)"}
                        </button>
                      </li>
                    ))}
                    {categoria.subcategorias.length === 0 && (
                      <li className="px-3 py-2 text-sm text-muted-foreground">
                        Sem subcategorias.
                      </li>
                    )}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
