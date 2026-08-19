import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: boolean;
}

export function Card({
  children,
  padding = true,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={["surface-panel", padding ? "p-6" : "", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
