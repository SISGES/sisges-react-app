import { useEffect, useState, type ReactNode } from "react";
import {
  downloadPrivateFile,
  fetchPrivateFile,
} from "../../services/uploadService";

export function useProtectedImage(path: string | null) {
  const [result, setResult] = useState<{
    path: string;
    url: string | null;
    failed: boolean;
  } | null>(null);
  const remote = !!path && /^(https?:|blob:|data:)/.test(path);
  useEffect(() => {
    if (!path || remote) return;
    let active = true;
    let objectUrl: string | null = null;
    fetchPrivateFile(path)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setResult({ path, url: objectUrl, failed: false });
      })
      .catch(() => {
        if (active) setResult({ path, url: null, failed: true });
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path, remote]);
  if (remote) return { url: path, loading: false };
  const current = result?.path === path ? result : null;
  return { url: current?.url ?? null, loading: !!path && !current };
}

export function useProtectedFileUrl(path: string | null): string | null {
  return useProtectedImage(path).url;
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
