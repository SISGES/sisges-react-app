import { useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

function buildWsUrl(): string {
  const base = API_BASE.replace(/\/api\/?$/, '')
  const protocol = base.startsWith('https') ? 'wss' : 'ws'
  const host = base.replace(/^https?:\/\//, '')
  return `${protocol}://${host}/ws`
}

export function useStompFeed(onFeedEvent: () => void) {
  const clientRef = useRef<Client | null>(null)
  const callbackRef = useRef(onFeedEvent)
  callbackRef.current = onFeedEvent

  const connect = useCallback(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    if (clientRef.current?.active) return

    const wsUrl = `${buildWsUrl()}?token=${encodeURIComponent(token)}`

    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        client.subscribe('/topic/feed', () => {
          callbackRef.current()
        })
      },
    })

    client.activate()
    clientRef.current = client
  }, [])

  useEffect(() => {
    connect()
    return () => {
      if (clientRef.current?.active) {
        clientRef.current.deactivate()
        clientRef.current = null
      }
    }
  }, [connect])
}
