import { useProtectedFileUrl } from "../ProtectedFile/ProtectedFile";

export const DEFAULT_AVATAR =
  "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg";

export function UserAvatar({
  path,
  name,
  className = "h-10 w-10",
}: {
  path?: string | null;
  name?: string;
  className?: string;
}) {
  const protectedUrl = useProtectedFileUrl(
    path?.startsWith("/api/files/") ? path : null,
  );
  const src = path?.startsWith("http") ? path : protectedUrl || DEFAULT_AVATAR;
  return (
    <img
      src={src}
      alt={name ? `Foto de ${name}` : "Foto do usuário"}
      className={`${className} shrink-0 rounded-full object-cover`}
    />
  );
}
