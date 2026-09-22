import arquivarAsset from "@/assets/arquivar.png.asset.json";

const estiloQuadrado =
  "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-black bg-white p-0 text-black transition-colors hover:bg-black/5";

export function IconeArquivar() {
  return <img src={arquivarAsset.url} alt="" className="size-[18px] object-contain" />;
}

type Props = {
  rotulo: string;
  onArquivar: () => void;
  /** Usa <span> em vez de <button> (para uso dentro de gatilhos de accordion). */
  comoSpan?: boolean;
};

export function BotaoArquivar({ rotulo, onArquivar, comoSpan = false }: Props) {
  if (comoSpan) {
    return (
      <span
        role="button"
        tabIndex={0}
        aria-label={rotulo}
        className={estiloQuadrado}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onArquivar();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            onArquivar();
          }
        }}
      >
        <IconeArquivar />
      </span>
    );
  }

  return (
    <button
      type="button"
      aria-label={rotulo}
      className={estiloQuadrado}
      onClick={(e) => {
        e.stopPropagation();
        onArquivar();
      }}
    >
      <IconeArquivar />
    </button>
  );
}
