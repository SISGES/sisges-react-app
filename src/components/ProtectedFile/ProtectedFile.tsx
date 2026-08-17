import { useEffect, useState, type ReactNode } from "react";
import {
  downloadPrivateFile,
  fetchPrivateFile,
} from "../../services/uploadService";

export function useProtectedFileUrl(path: string | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!path) {
      setUrl(null);
      return;
    }
    let active = true;
    let objectUrl: string | null = null;
    fetchPrivateFile(path)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => active && setUrl(null));
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path]);

  return url;
}

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
