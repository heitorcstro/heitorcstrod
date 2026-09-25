import { useState } from "react";
import { ChevronDown, ChevronRight, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Categoria, Pasta } from "./types";

type Props = {
  aberto: boolean;
  categorias: Categoria[];
  pastas: Pasta[];
  categoriaAtualId: string;
  nomeSubcategoria: string;
  onFechar: () => void;
  onEscolher: (categoriaId: string) => void;
};

export function DialogoTransferirSubcategoria({
  aberto,
  categorias,
  pastas,
  categoriaAtualId,
  nomeSubcategoria,
  onFechar,
  onEscolher,
}: Props) {
  const [pastaExpandidaId, setPastaExpandidaId] = useState<string | null>(null);
  const categoriasSoltas = categorias.filter((categoria) => !categoria.pastaId);

  const escolher = (categoriaId: string) => {
    if (categoriaId === categoriaAtualId) return;
    setPastaExpandidaId(null);
    onEscolher(categoriaId);
  };

  return (
    <Dialog
      open={aberto}
      onOpenChange={(estado) => {
        if (!estado) {
          setPastaExpandidaId(null);
          onFechar();
        }
      }}
    >
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transferir subcategoria</DialogTitle>
          <DialogDescription>
            Escolha a categoria de destino para “{nomeSubcategoria}”.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Categorias
            </h3>
            <div className="space-y-1">
              {categoriasSoltas.map((categoria) => (
                <Button
                  key={categoria.id}
                  type="button"
                  variant="ghost"
                  disabled={categoria.id === categoriaAtualId}
                  onClick={() => escolher(categoria.id)}
                  className="w-full justify-start"
                >
                  {categoria.nome}
                  {categoria.id === categoriaAtualId ? " (atual)" : ""}
                </Button>
              ))}
              {categoriasSoltas.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">Nenhuma categoria solta.</p>
              ) : null}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Pastas</h3>
            <div className="divide-y divide-border border-y border-border">
              {pastas.map((pasta) => {
                const aberta = pastaExpandidaId === pasta.id;
                const categoriasDaPasta = categorias.filter(
                  (categoria) => categoria.pastaId === pasta.id,
                );
                return (
                  <div key={pasta.id}>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setPastaExpandidaId(aberta ? null : pasta.id)}
                      className="h-auto w-full justify-between rounded-none px-1 py-3"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <Folder className="size-4 shrink-0" />
                        <span className="truncate">{pasta.nome}</span>
                      </span>
                      {aberta ? (
                        <ChevronDown className="size-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="size-4 text-muted-foreground" />
                      )}
                    </Button>
                    {aberta ? (
                      <div className="space-y-1 pb-3 pl-4">
                        {categoriasDaPasta.map((categoria) => (
                          <Button
                            key={categoria.id}
                            type="button"
                            variant="ghost"
                            disabled={categoria.id === categoriaAtualId}
                            onClick={() => escolher(categoria.id)}
                            className={cn(
                              "w-full justify-start",
                              categoria.id === categoriaAtualId && "text-muted-foreground",
                            )}
                          >
                            {categoria.nome}
                            {categoria.id === categoriaAtualId ? " (atual)" : ""}
                          </Button>
                        ))}
                        {categoriasDaPasta.length === 0 ? (
                          <p className="px-3 py-2 text-sm text-muted-foreground">
                            Sem categorias nesta pasta.
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
              {pastas.length === 0 ? (
                <p className="px-1 py-3 text-sm text-muted-foreground">Nenhuma pasta.</p>
              ) : null}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}