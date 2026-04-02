import { useState, useEffect, useCallback, useRef } from 'react'
import { FiHeart, FiMessageCircle } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import {
  getAnnouncementFeed,
  toggleAnnouncementLike,
  getAnnouncementComments,
  addAnnouncementComment,
  updateAnnouncementComment,
  deleteAnnouncementComment,
} from '../../services/announcementService'
import type { Announcement, AnnouncementComment } from '../../services/announcementService'
import { useAuth } from '../../contexts/AuthContext'
import { useStompFeed } from '../../hooks/useStompFeed'
import { CharCounter } from '../CharCounter/CharCounter'
import './AnnouncementFeed.css'

const COMMENT_MAX_CHARS = 250

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
const UPLOAD_BASE = API_BASE.replace('/api', '')

const FEED_POLL_FALLBACK_MS = 60000

function getImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  return `${UPLOAD_BASE}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
}

function formatRelativeTime(iso: string): string {
  const d = new Date(iso)
  const now = Date.now()
  const diff = Math.floor((now - d.getTime()) / 1000)
  if (diff < 60) return 'agora'
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`
  if (diff < 604800) return `há ${Math.floor(diff / 86400)} d`
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function AnnouncementCard({
  a,
  onLike,
  onRefresh,
  feedRefreshVersion,
}: {
  a: Announcement
  onLike: (id: number) => void
  onRefresh: () => void
  feedRefreshVersion: number
}) {
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<AnnouncementComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const { user } = useAuth()

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
    <article className="ig-card">
      <header className="ig-card-header">
        <div className="ig-card-header-text">
          <span className="ig-card-title">{a.title}</span>
        </div>
      </header>
      {a.type === 'IMAGE' && a.imagePath && (
        <div className="ig-card-media">
          <img src={getImageUrl(a.imagePath) ?? ''} alt="" />
        </div>
      )}
      {a.content && (
        <div className="ig-card-caption">{a.content}</div>
      )}
      <div className="ig-card-actions">
        <div className="ig-card-actions-left">
          <button
            type="button"
            onClick={() => user && onLike(a.id)}
            className={`ig-action-btn ${a.likedByCurrentUser ? 'liked' : ''}`}
            disabled={!user}
            title={a.likedByCurrentUser ? 'Descurtir' : 'Curtir'}
          >
            <FiHeart size={22} fill={a.likedByCurrentUser ? 'currentColor' : 'none'} />
            <span className="ig-action-count">{a.likeCount}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowComments((v) => !v)}
            className="ig-action-btn"
            title="Comentários"
          >
            <FiMessageCircle size={22} />
            <span className="ig-action-count">{a.commentCount}</span>
          </button>
        </div>
        <time className="ig-card-time" dateTime={a.createdAt}>
          {formatRelativeTime(a.createdAt)}
        </time>
      </div>
      {showComments && (
        <div className="ig-comments">
          {user && (
            <form onSubmit={handleAddComment} className="ig-comment-form">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicione um comentário..."
                className="ig-comment-input"
                disabled={isSubmitting}
                maxLength={COMMENT_MAX_CHARS}
              />
              {newComment.length > 0 && (
                <CharCounter current={newComment.length} max={COMMENT_MAX_CHARS} size={22} />
              )}
              <button type="submit" className="ig-comment-send" disabled={isSubmitting || !newComment.trim() || newComment.length > COMMENT_MAX_CHARS}>
                Publicar
              </button>
            </form>
          )}
          <ul className="ig-comment-list">
            {comments.map((c) => (
              <li key={c.id} className="ig-comment-row">
                <div className="ig-comment-header">
                  <span className="ig-comment-author">{c.user.name}</span>
                  <time className="ig-comment-time" dateTime={c.createdAt}>
                    {formatRelativeTime(c.createdAt)}
                  </time>
                </div>
                {editingCommentId === c.id ? (
                  <div className="ig-comment-edit-form">
                    <div className="ig-comment-edit-input-row">
                      <input
                        type="text"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="ig-comment-input"
                        disabled={isSubmitting}
                        maxLength={COMMENT_MAX_CHARS}
                      />
                      <CharCounter current={editContent.length} max={COMMENT_MAX_CHARS} size={22} />
                    </div>
                    <div className="ig-comment-edit-actions">
                      <button
                        type="button"
                        onClick={() => handleUpdateComment(c.id)}
                        className="ig-comment-action-btn ig-comment-action-save"
                        disabled={isSubmitting || !editContent.trim() || editContent.length > COMMENT_MAX_CHARS}
                      >
                        Salvar
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="ig-comment-action-btn"
                        disabled={isSubmitting}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="ig-comment-body">{c.content}</p>
                    {user?.id === c.user.id && (
                      <div className="ig-comment-actions">
                        <button
                          type="button"
                          onClick={() => startEditing(c)}
                          className="ig-comment-action-btn"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(c.id)}
                          className="ig-comment-action-btn ig-comment-action-delete"
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </>
                )}
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
  const { user } = useAuth()
  const navigate = useNavigate()

  const fetchFeed = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent === true
    if (!silent) {
      setIsLoading(true)
      setError(null)
    }
    try {
      const data = await getAnnouncementFeed()
      setAnnouncements(data)
      setFeedRefreshVersion((v) => v + 1)
      if (!silent) {
        setError(null)
      }
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar avisos.')
      }
    } finally {
      if (!silent) {
        setIsLoading(false)
      }
    }
  }, [])

  const handleLike = useCallback(
    async (id: number) => {
      try {
        await toggleAnnouncementLike(id)
        fetchFeed({ silent: true })
      } catch {
        void 0
      }
    },
    [fetchFeed]
  )

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const debouncedRefresh = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchFeed({ silent: true })
    }, 300)
  }, [fetchFeed])

  useStompFeed(debouncedRefresh)

  useEffect(() => {
    fetchFeed()
  }, [fetchFeed])

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') {
        fetchFeed({ silent: true })
      }
    }
    const id = window.setInterval(tick, FEED_POLL_FALLBACK_MS)
    return () => window.clearInterval(id)
  }, [fetchFeed])

  if (isLoading) {
    return (
      <div className="announcement-feed">
        <div className="announcement-feed-loading">
          <div className="loading-spinner-sm"></div>
          <span>Carregando avisos...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="announcement-feed">
        <div className="announcement-feed-error">
          <p>{error}</p>
          <button onClick={() => fetchFeed()} className="btn-retry">
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  if (announcements.length === 0) {
    return (
      <div className="announcement-feed">
        <div className="announcement-feed-empty">
          <p>Nenhum aviso no momento.</p>
        </div>
      </div>
    )
  }

  return (
    <section className="announcement-feed">
      {user?.role === 'ADMIN' && (
        <div className="announcement-feed-toolbar">
          <button
            type="button"
            className="announcement-feed-create-btn"
            onClick={() => navigate('/admin/announcements', { state: { openCreate: true } })}
          >
            Criar aviso
          </button>
        </div>
      )}
      <div className="announcement-feed-column">
        {announcements.map((a) => (
          <AnnouncementCard
            key={a.id}
            a={a}
            onLike={handleLike}
            onRefresh={() => fetchFeed({ silent: true })}
            feedRefreshVersion={feedRefreshVersion}
          />
        ))}
      </div>
    </section>
  )
}
