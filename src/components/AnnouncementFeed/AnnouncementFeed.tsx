import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  FiBell,
  FiCalendar,
  FiChevronRight,
  FiEdit2,
  FiHeart,
  FiMaximize2,
  FiMessageCircle,
  FiMoreVertical,
  FiPlus,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";
import {
  getAnnouncementFeed,
  toggleAnnouncementLike,
  getAnnouncementComments,
  addAnnouncementComment,
  updateAnnouncementComment,
  deleteAnnouncementComment,
  deleteAnnouncement,
} from "../../services/announcementService";
import type {
  Announcement,
  AnnouncementComment,
} from "../../services/announcementService";
import { useAuth } from "../../contexts/AuthContext";
import { useStompFeed } from "../../hooks/useStompFeed";
import { CharCounter } from "../CharCounter/CharCounter";
import { AnnouncementEditorModal } from "../AnnouncementEditorModal/AnnouncementEditorModal";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/FormField";
import { useProtectedFileUrl } from "../ProtectedFile/ProtectedFile";

const COMMENT_MAX_CHARS = 250;

const FEED_POLL_FALLBACK_MS = 60000;

function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "agora";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `há ${Math.floor(diff / 86400)} d`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function formatCompactDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Fixed preview height so all image posts align; image scales down inside the box. */
const FEED_IMAGE_PREVIEW_H = "h-72 sm:h-80"; // 18rem / 20rem

function FeedImage({ path, title }: { path: string; title: string }) {
  const [lightbox, setLightbox] = useState(false);
  const src = useProtectedFileUrl(path);

  useEffect(() => {
    if (!lightbox) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox]);

  if (!src) return null;
  return (
    <>
      <div className="w-full border-t border-b border-[var(--color-border)]/60 bg-[var(--color-background)]">
        <div className="mx-auto w-full max-w-full px-2 py-2 sm:px-3 sm:py-2.5">
          <div className="mx-auto w-full max-w-3xl sm:max-w-4xl">
            <button
              type="button"
              onClick={() => setLightbox(true)}
              className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl border-0 bg-[var(--color-surface)]/40 p-0 shadow-sm ring-1 ring-[var(--color-border)]/50 transition-shadow hover:ring-2 hover:ring-[var(--color-primary)]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              aria-label="Ampliar imagem"
            >
              <div
                className={[
                  "flex w-full items-center justify-center overflow-hidden",
                  FEED_IMAGE_PREVIEW_H,
                ].join(" ")}
              >
                <img
                  src={src}
                  alt={title}
                  className="max-h-full max-w-full object-contain"
                  decoding="async"
                />
              </div>
              <span
                className="pointer-events-none absolute bottom-2.5 right-2.5 flex items-center gap-1.5 rounded-md bg-black/55 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100"
                aria-hidden
              >
                <FiMaximize2 size={13} className="opacity-90" />
                Ampliar
              </span>
            </button>
          </div>
        </div>
      </div>

      {lightbox &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-0"
            role="dialog"
            aria-modal="true"
            aria-label="Visualização em tela cheia"
          >
            <div
              className="absolute inset-0 box-border flex items-center justify-center bg-black/92 p-0"
              onClick={() => setLightbox(false)}
            >
              {/*
                Fixed viewport box + img fill + object-contain: wide images use the full width of the box
                (w-auto/max-w on img was keeping horizontal shots small in some browsers).
              */}
              <div
                className="box-border h-[min(88dvh,calc(100dvh-3rem))] w-[min(98dvw,100dvw-0.5rem)] min-w-0 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={src}
                  alt={title}
                  className="block h-full w-full object-contain object-center shadow-2xl"
                  decoding="async"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLightbox(false)}
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Fechar"
            >
              <FiX size={22} />
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}

function AnnouncementCard({
  a,
  onLike,
  onRefresh,
  feedRefreshVersion,
  isAdmin,
  onEditAnnouncement,
  onDeleteAnnouncement,
}: {
  a: Announcement;
  onLike: (id: number) => void;
  onRefresh: () => void;
  feedRefreshVersion: number;
  isAdmin: boolean;
  onEditAnnouncement: (announcement: Announcement) => void;
  onDeleteAnnouncement: (id: number) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<AnnouncementComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [postMenuOpen, setPostMenuOpen] = useState(false);
  const [commentMenuId, setCommentMenuId] = useState<number | null>(null);
  const postMenuRef = useRef<HTMLDivElement | null>(null);
  const commentMenuRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuth();
  const isPeopleAnnouncement = /reuni|respons|família|familia/i.test(a.title);

  useEffect(() => {
    if (!postMenuOpen) return;
    const close = (e: MouseEvent) => {
      if (
        postMenuRef.current &&
        !postMenuRef.current.contains(e.target as Node)
      ) {
        setPostMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [postMenuOpen]);

  useEffect(() => {
    if (commentMenuId === null) return;
    const close = (e: MouseEvent) => {
      if (
        commentMenuRef.current &&
        !commentMenuRef.current.contains(e.target as Node)
      ) {
        setCommentMenuId(null);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [commentMenuId]);

  const loadComments = useCallback(async () => {
    if (!showComments) return;
    try {
      const list = await getAnnouncementComments(a.id);
      setComments(list);
    } catch {
      setComments([]);
    }
  }, [a.id, showComments]);

  useEffect(() => {
    if (!showComments) return;
    void loadComments();
  }, [showComments, feedRefreshVersion, loadComments]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addAnnouncementComment(a.id, newComment.trim());
      setNewComment("");
      loadComments();
      onRefresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (c: AnnouncementComment) => {
    setEditingCommentId(c.id);
    setEditContent(c.content);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editContent.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updateAnnouncementComment(a.id, commentId, editContent.trim());
      setEditingCommentId(null);
      setEditContent("");
      loadComments();
      onRefresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteAnnouncementComment(a.id, commentId);
      loadComments();
      onRefresh();
    } catch {
      void 0;
    }
  };

  return (
    <article className="relative overflow-visible border-b border-[var(--color-border)] bg-[var(--color-surface)] pl-[5.25rem] last:border-b-0">
      <div
        className={[
          "absolute left-6 top-6 flex h-11 w-11 items-center justify-center rounded-full border bg-[var(--color-surface)]",
          isPeopleAnnouncement
            ? "border-[var(--color-accent)] text-[var(--color-accent)]"
            : "border-[var(--color-primary)] text-[var(--color-primary)]",
        ].join(" ")}
        aria-hidden
      >
        {isPeopleAnnouncement ? <FiUsers size={20} /> : <FiBell size={20} />}
      </div>
      {/* Header */}
      <header className="flex items-start justify-between gap-3 pb-1 pr-6 pt-6">
        <h3 className="text-base font-bold leading-snug text-[var(--color-primary)]">
          {a.title}
        </h3>
        {isAdmin && (
          <div className="relative flex-shrink-0" ref={postMenuRef}>
            <button
              type="button"
              onClick={() => setPostMenuOpen((v) => !v)}
              aria-expanded={postMenuOpen}
              aria-haspopup="true"
              aria-label="Opções do aviso"
              className="flex items-center justify-center w-7 h-7 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-background)] transition-colors border-none bg-transparent cursor-pointer"
            >
              <FiMoreVertical size={16} />
            </button>
            {postMenuOpen && (
              <div
                role="menu"
                className="absolute right-full top-0 z-20 mr-1.5 min-w-[130px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg py-1 shadow-lg flex flex-col"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onEditAnnouncement(a);
                    setPostMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-background)] transition-colors border-none bg-transparent cursor-pointer text-left"
                >
                  <FiEdit2 size={13} />
                  Editar
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onDeleteAnnouncement(a.id);
                    setPostMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-error)] hover:bg-[var(--color-background)] transition-colors border-none bg-transparent cursor-pointer text-left"
                >
                  <FiTrash2 size={13} />
                  Excluir
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Content */}
      {a.content && (
        <p className="max-w-3xl py-2 pr-6 text-sm leading-6 text-[var(--color-text-secondary)]">
          {a.content}
        </p>
      )}

      {/* Image */}
      {a.type === "IMAGE" && a.imagePath && (
        <FeedImage path={a.imagePath} title={a.title} />
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 pr-6 pt-2">
        <div className="flex flex-wrap items-center gap-3">
          <time
            className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]"
            dateTime={a.createdAt}
          >
            {formatCompactDate(a.createdAt)}
          </time>
          <button
            type="button"
            onClick={() => user && onLike(a.id)}
            disabled={!user}
            title={a.likedByCurrentUser ? "Descurtir" : "Curtir"}
            className={[
              "flex items-center gap-1.5 text-sm border-none bg-transparent cursor-pointer transition-colors px-0 py-1",
              a.likedByCurrentUser
                ? "text-[var(--color-error)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-error)]",
              !user ? "cursor-default" : "",
            ].join(" ")}
          >
            <FiHeart
              size={19}
              fill={a.likedByCurrentUser ? "currentColor" : "none"}
            />
            <span>{a.likeCount}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowComments((v) => !v)}
            title="Comentários"
            className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border-none bg-transparent cursor-pointer transition-colors px-0 py-1"
          >
            <FiMessageCircle size={19} />
            <span>{a.commentCount}</span>
          </button>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium text-[var(--color-accent)]">
          <span className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full bg-[var(--color-accent)]"
              aria-hidden
            />
            Publicado
          </span>
          <FiChevronRight
            size={16}
            className="text-[var(--color-text-muted)]"
            aria-hidden
          />
        </div>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="mr-6 flex flex-col gap-3 border-t border-[var(--color-border)] pb-5 pt-4">
          {user && (
            <form
              onSubmit={handleAddComment}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicione um comentário..."
                disabled={isSubmitting}
                maxLength={COMMENT_MAX_CHARS}
                className="flex-1 px-3 py-1.5 text-sm bg-[var(--color-background)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
              {newComment.length > 0 && (
                <CharCounter
                  current={newComment.length}
                  max={COMMENT_MAX_CHARS}
                  size={22}
                />
              )}
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !newComment.trim() ||
                  newComment.length > COMMENT_MAX_CHARS
                }
                className="px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] border border-[var(--color-primary)] rounded-md bg-transparent hover:bg-[var(--color-primary)] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Publicar
              </button>
            </form>
          )}
          <ul className="flex flex-col gap-2 overflow-visible">
            {comments.map((c) => (
              <li key={c.id} className="flex flex-col gap-1 overflow-visible">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                        {c.user.name}
                      </span>
                      <time
                        className="text-xs text-[var(--color-text-muted)]"
                        dateTime={c.createdAt}
                      >
                        {formatRelativeTime(c.createdAt)}
                      </time>
                    </div>
                    {editingCommentId === c.id ? (
                      <div className="flex flex-col gap-2 mt-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            disabled={isSubmitting}
                            maxLength={COMMENT_MAX_CHARS}
                            className="flex-1 px-3 py-1.5 text-sm bg-[var(--color-background)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                          />
                          <CharCounter
                            current={editContent.length}
                            max={COMMENT_MAX_CHARS}
                            size={22}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateComment(c.id)}
                            disabled={
                              isSubmitting ||
                              !editContent.trim() ||
                              editContent.length > COMMENT_MAX_CHARS
                            }
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-[var(--color-primary)] rounded-md border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Salvar
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            disabled={isSubmitting}
                            className="px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)] bg-transparent border border-[var(--color-border)] rounded-md cursor-pointer hover:border-[var(--color-text-muted)] transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                        {c.content}
                      </p>
                    )}
                  </div>

                  {/* 3-dot menu — only visible to comment owner, not while editing */}
                  {user?.id === c.user.id && editingCommentId !== c.id && (
                    <div
                      className="relative flex-shrink-0"
                      ref={commentMenuId === c.id ? commentMenuRef : null}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setCommentMenuId((prev) =>
                            prev === c.id ? null : c.id,
                          )
                        }
                        aria-expanded={commentMenuId === c.id}
                        aria-haspopup="true"
                        aria-label="Opções do comentário"
                        className="flex items-center justify-center w-6 h-6 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-background)] transition-colors border-none bg-transparent cursor-pointer"
                      >
                        <FiMoreVertical size={14} />
                      </button>
                      {commentMenuId === c.id && (
                        <div
                          role="menu"
                          className="absolute right-full top-0 z-20 mr-1.5 min-w-[120px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg py-1 shadow-lg flex flex-col"
                        >
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              startEditing(c);
                              setCommentMenuId(null);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-background)] transition-colors border-none bg-transparent cursor-pointer text-left"
                          >
                            <FiEdit2 size={13} />
                            Editar
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              handleDeleteComment(c.id);
                              setCommentMenuId(null);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-error)] hover:bg-[var(--color-background)] transition-colors border-none bg-transparent cursor-pointer text-left"
                          >
                            <FiTrash2 size={13} />
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

export function AnnouncementFeed({
  dashboard = false,
}: {
  dashboard?: boolean;
}) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedRefreshVersion, setFeedRefreshVersion] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const canPostAnnouncements =
    user?.role === "ADMIN" || user?.role === "TEACHER";
  const firstName = user?.name?.trim().split(" ")[0] || "você";

  const todayLabel = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const events = [
    {
      day: 18,
      month: "AGO",
      title: "Conselho de classe",
      detail: "14h00 · Sala dos Professores",
    },
    { day: 20, month: "AGO", title: "Entrega de notas", detail: "Até 12h00" },
    {
      day: 25,
      month: "AGO",
      title: "Reunião pedagógica",
      detail: "15h00 · Auditório Principal",
    },
  ];

  const openCreate = () => {
    setEditingAnnouncement(null);
    setEditorOpen(true);
  };
  const openEdit = (a: Announcement) => {
    setEditingAnnouncement(a);
    setEditorOpen(true);
  };
  const closeEditor = () => {
    setEditorOpen(false);
    setEditingAnnouncement(null);
  };

  const fetchFeed = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent === true;
    if (!silent) {
      setIsLoading(true);
      setError(null);
    }
    try {
      const data = await getAnnouncementFeed();
      setAnnouncements(data);
      setFeedRefreshVersion((v) => v + 1);
      if (!silent) setError(null);
    } catch (err) {
      if (!silent)
        setError(
          err instanceof Error ? err.message : "Erro ao carregar avisos.",
        );
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  const handleDeleteAnnouncement = useCallback(
    async (id: number) => {
      if (!window.confirm("Excluir este aviso?")) return;
      try {
        await deleteAnnouncement(id);
        fetchFeed({ silent: true });
      } catch {
        void 0;
      }
    },
    [fetchFeed],
  );

  const handleLike = useCallback(
    async (id: number) => {
      try {
        await toggleAnnouncementLike(id);
        fetchFeed({ silent: true });
      } catch {
        void 0;
      }
    },
    [fetchFeed],
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedRefresh = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchFeed({ silent: true }), 300);
  }, [fetchFeed]);

  useStompFeed(debouncedRefresh);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") fetchFeed({ silent: true });
    };
    const id = window.setInterval(tick, FEED_POLL_FALLBACK_MS);
    return () => window.clearInterval(id);
  }, [fetchFeed]);

  return (
    <div
      className={
        dashboard
          ? "page-canvas flex flex-1 flex-col"
          : "flex flex-1 flex-col p-5 sm:p-6"
      }
    >
      <AnnouncementEditorModal
        open={editorOpen}
        onClose={closeEditor}
        onSuccess={() => fetchFeed({ silent: true })}
        editingAnnouncement={editingAnnouncement}
      />

      {dashboard && (
        <>
          <header className="mb-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-[-0.035em] text-[var(--color-text-primary)] sm:text-[2rem]">
                Bom dia, {firstName}
              </h1>
              <p className="mt-1.5 text-sm capitalize text-[var(--color-text-secondary)]">
                {todayLabel}
              </p>
            </div>
            {canPostAnnouncements && (
              <Button
                className="min-h-14 px-5"
                onClick={openCreate}
                icon={<FiPlus size={18} />}
              >
                Criar aviso
              </Button>
            )}
          </header>
          <h2 className="mb-6 text-xl font-bold text-[var(--color-text-primary)]">
            Visão geral da escola
          </h2>
        </>
      )}

      <div
        className={
          dashboard
            ? "grid min-h-0 flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_280px]"
            : "flex min-h-0 flex-1 flex-col"
        }
      >
        <section
          className="surface-panel min-h-0 overflow-hidden"
          aria-labelledby="announcements-title"
        >
          <div className="flex min-h-16 items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <h2
                id="announcements-title"
                className="text-base font-bold text-[var(--color-text-primary)]"
              >
                {dashboard ? "Avisos importantes" : "Avisos"}
              </h2>
              {!isLoading && !error && (
                <span className="rounded-full bg-[var(--color-surface-subtle)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)]">
                  {announcements.length}
                </span>
              )}
            </div>
            {!dashboard && canPostAnnouncements && (
              <Button
                size="sm"
                onClick={openCreate}
                icon={<FiPlus size={14} />}
              >
                Criar aviso
              </Button>
            )}
          </div>

          {/* States */}
          {isLoading ? (
            <div
              className="flex min-h-[min(50vh,22rem)] w-full flex-col items-center justify-center gap-3 py-12 text-[var(--color-text-muted)]"
              aria-busy="true"
              aria-live="polite"
            >
              <Spinner size="md" />
              <span className="text-sm">Carregando avisos...</span>
            </div>
          ) : error ? (
            <div className="flex min-h-[min(50vh,22rem)] w-full flex-col items-center justify-center gap-3 py-12 text-center text-[var(--color-error)]">
              <p className="text-sm">{error}</p>
              <button
                onClick={() => fetchFeed()}
                className="cursor-pointer rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-sm text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                Tentar novamente
              </button>
            </div>
          ) : announcements.length === 0 ? (
            <div className="flex min-h-[min(50vh,22rem)] w-full flex-col items-center justify-center gap-2 px-6 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-primary)]">
                <FiBell size={20} aria-hidden />
              </div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                Nenhum aviso no momento
              </p>
              <p className="max-w-sm text-sm text-[var(--color-text-muted)]">
                Novos comunicados da escola aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="content-reveal">
              {announcements.map((a) => (
                <AnnouncementCard
                  key={a.id}
                  a={a}
                  onLike={handleLike}
                  onRefresh={() => fetchFeed({ silent: true })}
                  feedRefreshVersion={feedRefreshVersion}
                  isAdmin={isAdmin}
                  onEditAnnouncement={openEdit}
                  onDeleteAnnouncement={handleDeleteAnnouncement}
                />
              ))}
            </div>
          )}
        </section>

        {dashboard && (
          <aside
            className="surface-panel overflow-hidden"
            aria-labelledby="events-title"
          >
            <div className="flex min-h-16 items-center gap-2 border-b border-[var(--color-border)] px-5 py-4">
              <FiCalendar
                size={18}
                className="text-[var(--color-primary)]"
                aria-hidden
              />
              <h2
                id="events-title"
                className="text-base font-bold text-[var(--color-text-primary)]"
              >
                Próximos eventos
              </h2>
            </div>
            <div className="px-5">
              {events.map((event) => (
                <div
                  key={`${event.day}-${event.title}`}
                  className="flex gap-4 border-b border-[var(--color-border)] py-5 last:border-b-0"
                >
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-[var(--color-surface-subtle)] text-[var(--color-text-primary)]">
                    <span className="text-lg font-bold leading-none">
                      {event.day}
                    </span>
                    <span className="mt-1 text-[0.65rem] font-bold tracking-wide text-[var(--color-primary)]">
                      {event.month}
                    </span>
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <h3 className="text-sm font-bold leading-5 text-[var(--color-text-primary)]">
                      {event.title}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
                      {event.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
