import { useEffect, useRef, useState, type DragEvent } from "react";
import { FiUploadCloud, FiX } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import { getMyProfile, updateMyProfile } from "../../services/userService";
import { uploadFile } from "../../services/uploadService";
import { UserAvatar } from "../../components/UserAvatar/UserAvatar";
import { Alert, Input } from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";
import type { UserDetailResponse } from "../../types/auth";

export function Account() {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState<UserDetailResponse | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [draggingImage, setDraggingImage] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    void getMyProfile().then((p) => {
      setProfile(p);
      setName(p.name);
    });
  }, []);
  if (!profile) return <div className="page-canvas">Carregando...</div>;
  const editable = profile.role === "ADMIN" || profile.role === "TEACHER";
  const selectImage = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Selecione um arquivo de imagem válido.");
      return;
    }
    setMessage("");
    setImage(file);
  };
  const dropImage = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDraggingImage(false);
    selectImage(event.dataTransfer.files?.[0]);
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      let profileImagePath = profile.profileImagePath || undefined;
      if (image) profileImagePath = (await uploadFile(image, "profile-img")).path;
      const updated = await updateMyProfile({
        name,
        password: password || undefined,
        currentPassword: password ? currentPassword : undefined,
        profileImagePath,
      });
      setProfile(updated);
      setPassword("");
      setCurrentPassword("");
      setImage(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      await refreshUser();
      setMessage("Perfil atualizado.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Erro ao atualizar perfil.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="page-canvas">
      <div className="mx-auto max-w-2xl surface-panel p-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Minha conta
        </h1>
        <div className="my-6 flex items-center gap-4">
          <UserAvatar
            path={profile.profileImagePath}
            name={profile.name}
            className="h-20 w-20"
          />
          <div>
            <p className="font-semibold text-[var(--color-text-primary)]">
              {profile.email}
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              {profile.register}
            </p>
          </div>
        </div>
        {message && (
          <Alert type={message === "Perfil atualizado." ? "success" : "error"}>
            {message}
          </Alert>
        )}
        <form onSubmit={save} className="mt-5 flex flex-col gap-4">
          <label className="text-sm font-medium">
            Nome
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!editable}
            />
          </label>
          {editable && (
            <>
              <label className="text-sm font-medium">
                Nova senha
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                />
              </label>
              {password && (
                <label className="text-sm font-medium">
                  Senha atual
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </label>
              )}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Foto de perfil</span>
                <input
                  ref={imageInputRef}
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => selectImage(e.target.files?.[0])}
                />
                <label
                  htmlFor="profile-image"
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setDraggingImage(true);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDragLeave={() => setDraggingImage(false)}
                  onDrop={dropImage}
                  className={[
                    "flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-5 py-6 text-center transition-colors",
                    draggingImage
                      ? "border-[var(--color-primary)] bg-[var(--color-background)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface-subtle)] hover:border-[var(--color-primary)]",
                  ].join(" ")}
                >
                  <FiUploadCloud
                    size={28}
                    className="text-[var(--color-primary)]"
                    aria-hidden
                  />
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                    Arraste uma imagem ou clique para selecionar
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    PNG, JPG, GIF ou WebP de até 10 MB
                  </span>
                </label>
                {image && (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm">
                    <span className="min-w-0 truncate text-[var(--color-text-secondary)]">
                      {image.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        if (imageInputRef.current) imageInputRef.current.value = "";
                      }}
                      aria-label="Remover imagem selecionada"
                      className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-background)] hover:text-[var(--color-error)]"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                )}
              </div>
              <Button type="submit" loading={saving}>
                Salvar alterações
              </Button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
