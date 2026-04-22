import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { FiEdit2, FiHeart, FiMessageCircle, FiMaximize2, FiMoreVertical, FiTrash2, FiPlus, FiX } from 'react-icons/fi'
import {
  getAnnouncementFeed,
  toggleAnnouncementLike,
  getAnnouncementComments,
  addAnnouncementComment,
  updateAnnouncementComment,
  deleteAnnouncementComment,
  deleteAnnouncement,
} from '../../services/announcementService'
import type { Announcement, AnnouncementComment } from '../../services/announcementService'
import { useAuth } from '../../contexts/AuthContext'
import { useStompFeed } from '../../hooks/useStompFeed'
import { CharCounter } from '../CharCounter/CharCounter'
import { AnnouncementEditorModal } from '../AnnouncementEditorModal/AnnouncementEditorModal'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/FormField'

const COMMENT_MAX_CHARS = 250

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
const UPLOAD_BASE = API_BASE.replace('/api', '')
const FEED_POLL_FALLBACK_MS = 60000

function getImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath
  return `${UPLOAD_BASE}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
}

function formatRelativeTime(iso: string): string {
  const d = new Date(iso)
  const diff = Math.floor((Date.now() - d.getTime()) / 1000)
  if (diff < 60) return 'agora'
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`
  if (diff < 604800) return `há ${Math.floor(diff / 86400)} d`
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

/** Fixed preview height so all image posts align; image scales down inside the box. */
const FEED_IMAGE_PREVIEW_H = 'h-72 sm:h-80' // 18rem / 20rem

function FeedImage({ src, title }: { src: string; title: string }) {
  const [lightbox, setLightbox] = useState(false)

  useEffect(() => {
    if (!lightbox) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [lightbox])

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
                  'flex w-full items-center justify-center overflow-hidden',
                  FEED_IMAGE_PREVIEW_H,
                ].join(' ')}
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

      {lightbox
        && createPortal(
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
  )
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
  a: Announcement
  onLike: (id: number) => void
  onRefresh: () => void
  feedRefreshVersion: number
  isAdmin: boolean
  onEditAnnouncement: (announcement: Announcement) => void
  onDeleteAnnouncement: (id: number) => void
}) {
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<AnnouncementComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [postMenuOpen, setPostMenuOpen] = useState(false)
  const [commentMenuId, setCommentMenuId] = useState<number | null>(null)
  const postMenuRef = useRef<HTMLDivElement | null>(null)
  const commentMenuRef = useRef<HTMLDivElement | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!postMenuOpen) return
    const close = (e: MouseEvent) => {
      if (postMenuRef.current && !postMenuRef.current.contains(e.target as Node)) {
        setPostMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [postMenuOpen])

  useEffect(() => {
    if (commentMenuId === null) return
    const close = (e: MouseEvent) => {
      if (commentMenuRef.current && !commentMenuRef.current.contains(e.target as Node)) {
        setCommentMenuId(null)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [commentMenuId])

  const loadComments = useCallback(async () => {
    if (!showComments) return
    try {
      const list = await getAnnouncementComments(a.id)
      setComments(list)
    } catch {
      setComments([])
    }
  }, [a.id, showComments])

  useEffect(() => {
    if (!showComments) return
    void loadComments()
  }, [showComments, feedRefreshVersion, loadComments])

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return
    setIsSubmitting(true)
    try {
      await addAnnouncementComment(a.id, newComment.trim())
      setNewComment('')
      loadComments()
      onRefresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  const startEditing = (c: AnnouncementComment) => {
    setEditingCommentId(c.id)
    setEditContent(c.content)
  }

  const cancelEditing = () => {
    setEditingCommentId(null)
    setEditContent('')
  }

  const handleUpdateComment = async (commentId: number) => {
    if (!editContent.trim() || isSubmitting) return
    setIsSubmitting(true)
    try {
      await updateAnnouncementComment(a.id, commentId, editContent.trim())
      setEditingCommentId(null)
      setEditContent('')
      loadComments()
      onRefresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteAnnouncementComment(a.id, commentId)
      loadComments()
      onRefresh()
    } catch {
      void 0
    }
  }

  return (
    <article className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] overflow-visible">
      {/* Header */}
      <header className="flex items-start justify-between gap-3 px-4 py-3 border-b border-[var(--color-border)]">
        <span className="font-semibold text-[var(--color-text-primary)] text-sm leading-snug">{a.title}</span>
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
                  onClick={() => { onEditAnnouncement(a); setPostMenuOpen(false) }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-background)] transition-colors border-none bg-transparent cursor-pointer text-left"
                >
                  <FiEdit2 size={13} />
                  Editar
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { onDeleteAnnouncement(a.id); setPostMenuOpen(false) }}
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
        <p className="px-4 py-3 text-sm text-[var(--color-text-secondary)] leading-relaxed">{a.content}</p>
      )}

      {/* Image */}
      {a.type === 'IMAGE' && a.imagePath && (
        <FeedImage
          src={getImageUrl(a.imagePath) ?? ''}
          title={a.title}
        />
      )}

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => user && onLike(a.id)}
            disabled={!user}
            title={a.likedByCurrentUser ? 'Descurtir' : 'Curtir'}
            className={[
              'flex items-center gap-1.5 text-sm border-none bg-transparent cursor-pointer transition-colors px-0 py-1',
              a.likedByCurrentUser
                ? 'text-[var(--color-error)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-error)]',
              !user ? 'cursor-default' : '',
            ].join(' ')}
          >
            <FiHeart size={19} fill={a.likedByCurrentUser ? 'currentColor' : 'none'} />
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
        <time className="text-xs text-[var(--color-text-muted)]" dateTime={a.createdAt}>
          {formatRelativeTime(a.createdAt)}
        </time>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-[var(--color-border)] px-4 pt-3 pb-4 flex flex-col gap-3">
          {user && (
            <form onSubmit={handleAddComment} className="flex items-center gap-2">
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
                <CharCounter current={newComment.length} max={COMMENT_MAX_CHARS} size={22} />
              )}
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim() || newComment.length > COMMENT_MAX_CHARS}
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
                      <span className="text-xs font-semibold text-[var(--color-text-primary)]">{c.user.name}</span>
                      <time className="text-xs text-[var(--color-text-muted)]" dateTime={c.createdAt}>
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
                          <CharCounter current={editContent.length} max={COMMENT_MAX_CHARS} size={22} />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateComment(c.id)}
                            disabled={isSubmitting || !editContent.trim() || editContent.length > COMMENT_MAX_CHARS}
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
                      <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{c.content}</p>
                    )}
                  </div>

                  {/* 3-dot menu — only visible to comment owner, not while editing */}
                  {user?.id === c.user.id && editingCommentId !== c.id && (
                    <div className="relative flex-shrink-0" ref={commentMenuId === c.id ? commentMenuRef : null}>
                      <button
                        type="button"
                        onClick={() => setCommentMenuId((prev) => prev === c.id ? null : c.id)}
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
                            onClick={() => { startEditing(c); setCommentMenuId(null) }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-background)] transition-colors border-none bg-transparent cursor-pointer text-left"
                          >
                            <FiEdit2 size={13} />
                            Editar
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => { handleDeleteComment(c.id); setCommentMenuId(null) }}
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
  )
}

export function AnnouncementFeed() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedRefreshVersion, setFeedRefreshVersion] = useState(0)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const canPostAnnouncements = user?.role === 'ADMIN' || user?.role === 'TEACHER'

  const openCreate = () => { setEditingAnnouncement(null); setEditorOpen(true) }
  const openEdit = (a: Announcement) => { setEditingAnnouncement(a); setEditorOpen(true) }
  const closeEditor = () => { setEditorOpen(false); setEditingAnnouncement(null) }

  const fetchFeed = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent === true
    if (!silent) { setIsLoading(true); setError(null) }
    try {
      const data = await getAnnouncementFeed()
      setAnnouncements(data)
      setFeedRefreshVersion((v) => v + 1)
      if (!silent) setError(null)
    } catch (err) {
      if (!silent) setError(err instanceof Error ? err.message : 'Erro ao carregar avisos.')
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [])

  const handleDeleteAnnouncement = useCallback(async (id: number) => {
    if (!window.confirm('Excluir este aviso?')) return
    try {
      await deleteAnnouncement(id)
      fetchFeed({ silent: true })
    } catch { void 0 }
  }, [fetchFeed])

  const handleLike = useCallback(async (id: number) => {
    try {
      await toggleAnnouncementLike(id)
      fetchFeed({ silent: true })
    } catch { void 0 }
  }, [fetchFeed])

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const debouncedRefresh = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchFeed({ silent: true }), 300)
  }, [fetchFeed])

  useStompFeed(debouncedRefresh)

  useEffect(() => { fetchFeed() }, [fetchFeed])
  useEffect(() => {
    const tick = () => { if (document.visibilityState === 'visible') fetchFeed({ silent: true }) }
    const id = window.setInterval(tick, FEED_POLL_FALLBACK_MS)
    return () => window.clearInterval(id)
  }, [fetchFeed])

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <AnnouncementEditorModal
        open={editorOpen}
        onClose={closeEditor}
        onSuccess={() => fetchFeed({ silent: true })}
        editingAnnouncement={editingAnnouncement}
      />

      {/* Toolbar */}
      {canPostAnnouncements && (
        <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-border)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Avisos</h2>
          <Button size="sm" onClick={openCreate} icon={<FiPlus size={14} />}>
            Criar aviso
          </Button>
        </div>
      )}

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
            className="text-sm px-3 py-1.5 border border-[var(--color-border)] rounded-md bg-transparent text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] cursor-pointer transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      ) : announcements.length === 0 ? (
        <div className="flex min-h-[min(50vh,22rem)] w-full items-center justify-center py-12">
          <p className="text-sm text-[var(--color-text-muted)]">Nenhum aviso no momento.</p>
        </div>
      ) : (
        <section className="content-reveal flex flex-col gap-4 p-6">
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
        </section>
      )}
    </div>
  )
}
