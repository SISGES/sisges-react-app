import { useEffect, useState } from "react";
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
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    void getMyProfile().then((p) => {
      setProfile(p);
      setName(p.name);
    });
  }, []);
  if (!profile) return <div className="page-canvas">Carregando...</div>;
  const editable = profile.role === "ADMIN" || profile.role === "TEACHER";
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
              <label className="text-sm font-medium">
                Foto de perfil
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                />
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
