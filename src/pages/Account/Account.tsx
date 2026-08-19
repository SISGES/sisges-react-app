import { useEffect, useRef, useState } from "react";
import { FiCamera, FiUploadCloud } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import { getMyProfile, updateMyProfile } from "../../services/userService";
import { uploadFile } from "../../services/uploadService";
import { UserAvatar } from "../../components/UserAvatar/UserAvatar";
import { Alert, Input } from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";
import type { UserDetailResponse } from "../../types/auth";
import { PASSWORD_HELP, PASSWORD_PATTERN } from "../../utils/password";

export function Account() {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState<UserDetailResponse | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    void getMyProfile().then((p) => {
      setProfile(p);
      setName(p.name);
    });
  }, []);
  useEffect(
    () => () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    },
    [imagePreview],
  );
  if (!profile) return <div className="page-canvas">Carregando...</div>;
  const editable = profile.role === "ADMIN" || profile.role === "TEACHER";
  const selectImage = (file?: File) => {
    if (!file?.type.startsWith("image/")) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      let profileImagePath = profile.profileImagePath || undefined;
      if (image) profileImagePath = (await uploadFile(image, "profiles")).path;
      const updated = await updateMyProfile({
        name,
        password: password || undefined,
        profileImagePath,
      });
      setProfile(updated);
      setPassword("");
      setImage(null);
      setImagePreview(null);
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
          <div
            className={`relative shrink-0 rounded-full ${isDragOver ? "ring-4 ring-[var(--color-primary)]/25" : ""}`}
            onDragOver={(event) => {
              if (!editable) return;
              event.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(event) => {
              if (!editable) return;
              event.preventDefault();
              setIsDragOver(false);
              selectImage(event.dataTransfer.files?.[0]);
            }}
          >
            <UserAvatar
              path={imagePreview || profile.profileImagePath}
              name={profile.name}
              className="h-24 w-24"
            />
            {editable && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => selectImage(event.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Alterar foto de perfil"
                  title="Clique ou arraste uma foto"
                  className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full border-0 bg-black/0 text-white opacity-0 transition-all hover:bg-black/45 hover:opacity-100 focus-visible:bg-black/45 focus-visible:opacity-100"
                >
                  {isDragOver ? (
                    <FiUploadCloud size={25} />
                  ) : (
                    <FiCamera size={23} />
                  )}
                </button>
              </>
            )}
          </div>
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
                  pattern={PASSWORD_PATTERN.source}
                  title={PASSWORD_HELP}
                />
                <span className="mt-1 block text-xs font-normal text-[var(--color-text-muted)]">
                  {PASSWORD_HELP}
                </span>
              </label>
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
