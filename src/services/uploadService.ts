const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

function getToken(): string | null {
  return localStorage.getItem("token");
}

export async function uploadFile(
  file: File,
  subdir: string = "general",
): Promise<{ path: string }> {
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
  const prefixes = [
    "announcements/",
    "profiles/",
    "materials/",
    "activities/",
    "general/",
  ];
  const prefix = prefixes.find((candidate) => path.includes(candidate));
  if (!prefix) throw new Error("Caminho de arquivo inválido");
  const key = path.slice(path.indexOf(prefix));
  return `${API_BASE_URL}/files/${key}`;
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
