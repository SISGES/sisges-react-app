const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

type UploadDestination =
  | "lesson-files"
  | "materials"
  | "activities"
  | "post-img"
  | "profile-img";

export const schoolFileAccept =
  ".pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp";

function getToken(): string | null {
  return localStorage.getItem("token");
}

export async function uploadFile(
  file: File,
  subdir: UploadDestination,
): Promise<{ path: string }> {
  if (!file.size || file.size > 10 * 1024 * 1024) {
    throw new Error("Selecione um arquivo não vazio de até 10 MiB.");
  }
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("subdir", subdir);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Erro ao enviar arquivo");
  }

  const data = await response.json();
  return { path: data.path };
}

function privateFileUrl(path: string): string {
  // O armazenamento local legado gravava /uploads/ e o MinIO e o R2 usam /api/files/.
  const match = path.match(
    /(?:^|\/)(lesson-files|post-img|announcements|profile-img|materials|activities|general)\/(.+)$/,
  );
  if (!match) throw new Error("Caminho de arquivo inválido");
  const segments = [match[1], ...match[2].split("/")];
  const invalid = segments.some(
    (part) => !part || part === "." || part === ".." || part.includes("\\"),
  );
  if (invalid) {
    throw new Error("Caminho de arquivo inválido");
  }
  return `${API_BASE_URL}/files/${segments.map(encodeURIComponent).join("/")}`;
}

export async function fetchPrivateFile(path: string): Promise<Blob> {
  const token = getToken();
  const response = await fetch(privateFileUrl(path), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error("Não foi possível carregar o arquivo");
  return response.blob();
}

export async function downloadPrivateFile(path: string): Promise<void> {
  const blob = await fetchPrivateFile(path);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = path.split("/").pop() || "arquivo";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
