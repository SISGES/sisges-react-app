import { useState, type ReactNode } from "react";
import { downloadPrivateFile } from "../../services/uploadService";

export function ProtectedDownloadButton({
  path,
  className,
  children,
}: {
  path: string;
  className?: string;
  children: ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  return (
    <button
      type="button"
      className={className}
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await downloadPrivateFile(path);
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? "Baixando…" : children}
    </button>
  );
}
