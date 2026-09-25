import { useEffect, useState } from "react";
import type { Categoria } from "./types";
import { ESTILOS_COR_CATEGORIA } from "./cores-categoria";

const CORES_CICLO = [
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-red-500",
];

export function PainelCorCategoria({
  categoria,
  pendentes,
  className,
  children,
}: {
  categoria: Categoria;
  pendentes: number;
  className: string;
  children: React.ReactNode;
}) {
  const ehUrgente = categoria.nome.trim().toLowerCase() === "urgente";
  const deveCiclar = ehUrgente && pendentes > 0;
  const [indiceCiclo, setIndiceCiclo] = useState(0);

  useEffect(() => {
    if (!deveCiclar) return;
    const interval = setInterval(() => {
      setIndiceCiclo((i) => (i + 1) % CORES_CICLO.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [deveCiclar]);

  const fundo = deveCiclar
    ? CORES_CICLO[indiceCiclo]
    : ESTILOS_COR_CATEGORIA[categoria.cor].fundo;

  return (
    <div className={`${className} ${fundo}`}>
      {children}
    </div>
  );
}
