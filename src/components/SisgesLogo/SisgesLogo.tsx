type Variant = "mark" | "lockup";

/** Open Book. Assets are generated from brand/open-book/generate.py. */
export function SisgesLogo({
  variant = "mark",
  tone = "auto",
  className = "",
  textClassName = "text-base sm:text-lg",
  title = "SISGES",
  "aria-label": ariaLabel = "SISGES - Sistema de Gestão Escolar",
}: {
  variant?: Variant;
  /** Use inverse on surfaces that stay dark regardless of the active theme. */
  tone?: "auto" | "inverse";
  className?: string;
  textClassName?: string;
  title?: string;
  "aria-label"?: string;
}) {
  const asset = variant === "lockup" ? "horizontal" : "symbol";
  const dimensions = variant === "lockup"
    ? "h-[1.5em] w-auto max-w-full"
    : "h-full w-full";

  return (
    <span
      role="img"
      aria-label={ariaLabel}
      title={title}
      data-logo-tone={tone}
      className={[
        "sisges-logo inline-flex shrink-0 items-center",
        variant === "lockup" ? `min-w-0 max-w-full ${textClassName}` : "h-8 w-8",
        className,
      ].join(" ")}
    >
      <img
        src={`/brand/sisges-${asset}-navy.svg`}
        className={`sisges-logo-positive ${dimensions}`}
        alt=""
        aria-hidden="true"
        width={variant === "lockup" ? 520 : 100}
        height={variant === "lockup" ? 120 : 100}
      />
      <img
        src={`/brand/sisges-${asset}-white.svg`}
        className={`sisges-logo-negative ${dimensions}`}
        alt=""
        aria-hidden="true"
        width={variant === "lockup" ? 520 : 100}
        height={variant === "lockup" ? 120 : 100}
      />
    </span>
  );
}
