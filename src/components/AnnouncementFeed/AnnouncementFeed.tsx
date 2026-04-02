import { useState, useEffect, useCallback } from 'react'
import { FiHeart, FiMessageCircle } from 'react-icons/fi'
import {
  getAnnouncementFeed,
  toggleAnnouncementLike,
  getAnnouncementComments,
  addAnnouncementComment,
  deleteAnnouncementComment,
} from '../../services/announcementService'
import type { Announcement, AnnouncementComment } from '../../services/announcementService'
import { useAuth } from '../../contexts/AuthContext'
import './AnnouncementFeed.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
const UPLOAD_BASE = API_BASE.replace('/api', '')

const FEED_POLL_MS = 15000

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
}: {
  a: Announcement
  onLike: (id: number) => void
  onRefresh: () => void
}) {
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<AnnouncementComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
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
    loadComments()
  }, [loadComments])

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
          <time className="ig-card-time" dateTime={a.createdAt}>
            {formatRelativeTime(a.createdAt)}
          </time>
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
              />
              <button type="submit" className="ig-comment-send" disabled={isSubmitting || !newComment.trim()}>
                Publicar
              </button>
            </form>
          )}
          <ul className="ig-comment-list">
            {comments.map((c) => (
              <li key={c.id} className="ig-comment-row">
                <span className="ig-comment-author">{c.user.name}</span>
                <span className="ig-comment-body">{c.content}</span>
                {user?.id === c.user.id && (
                  <button
                    type="button"
                    onClick={() => handleDeleteComment(c.id)}
                    className="ig-comment-delete"
                  >
                    Excluir
                  </button>
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

  const fetchFeed = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent === true
    if (!silent) {
      setIsLoading(true)
      setError(null)
    }
    try {
      const data = await getAnnouncementFeed()
      setAnnouncements(data)
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

  useEffect(() => {
    fetchFeed()
  }, [fetchFeed])

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') {
        fetchFeed({ silent: true })
      }
    }
    const id = window.setInterval(tick, FEED_POLL_MS)
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
      <h2 className="announcement-feed-heading">Avisos</h2>
      <div className="announcement-feed-column">
        {announcements.map((a) => (
          <AnnouncementCard key={a.id} a={a} onLike={handleLike} onRefresh={() => fetchFeed({ silent: true })} />
        ))}
      </div>
    </section>
  )
}
