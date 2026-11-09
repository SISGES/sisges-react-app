import { useState, type ImgHTMLAttributes, type ReactNode } from "react";
import { FiImage } from "react-icons/fi";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  pending?: boolean;
  containerClassName: string;
  fallback?: ReactNode;
};

export function LoadingImage({
  src,
  pending = false,
  containerClassName,
  fallback,
  className = "",
  alt = "",
  onLoad,
  onError,
  ...props
}: Props) {
  // Track the source alongside its result so a changed URL immediately shows a skeleton.
  const [result, setResult] = useState<{
    src: string;
    status: "loaded" | "error";
  } | null>(null);
  const status = result?.src === src ? result?.status : undefined;
  const loading = pending || (!!src && !status);
  const failed = !loading && (!src || status === "error");
  return (
    <span
      className={`relative overflow-hidden ${containerClassName}`}
      aria-busy={loading}
    >
      {loading && (
        <span
          data-testid="image-skeleton"
          role="status"
          className="absolute inset-0 z-10 block bg-[var(--color-surface-subtle)] motion-safe:animate-pulse"
        >
          <span className="sr-only">Carregando imagem…</span>
        </span>
      )}
      {src && !failed && (
        <img
          {...props}
          src={src}
          alt={alt}
          decoding="async"
          className={`${className} ${loading ? "opacity-0" : "opacity-100"}`}
          onLoad={(event) => {
            setResult({ src, status: "loaded" });
            onLoad?.(event);
          }}
          onError={(event) => {
            setResult({ src, status: "error" });
            onError?.(event);
          }}
        />
      )}
      {failed && (
        <span
          role="img"
          aria-label={
            alt ? `${alt} — imagem indisponível` : "Imagem indisponível"
          }
          className="flex h-full w-full items-center justify-center bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]"
        >
          {fallback ?? (
            <span className="flex items-center gap-2 text-xs">
              <FiImage aria-hidden size={18} />
              Imagem indisponível
            </span>
          )}
        </span>
      )}
    </span>
  );
}
