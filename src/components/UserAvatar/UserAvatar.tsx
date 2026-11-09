import { LoadingImage } from "../ui/LoadingImage";
import { useProtectedImage } from "../ProtectedFile/ProtectedFile";

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
  const { url, loading } = useProtectedImage(path || null);
  const initials =
    name
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?";
  return (
    <LoadingImage
      src={url}
      pending={loading}
      alt={name ? `Foto de ${name}` : "Foto do usuário"}
      containerClassName={`${className} inline-flex shrink-0 rounded-full`}
      className="h-full w-full object-cover"
      fallback={
        <span className="text-xs font-semibold" aria-hidden>
          {initials}
        </span>
      }
    />
  );
}
