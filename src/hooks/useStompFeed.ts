import { useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

function buildWsUrl(): string {
  const url = new URL(API_BASE, window.location.origin);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = url.pathname.replace(/\/api\/?$/, "") + "/ws";
  url.search = "";
  url.hash = "";
  return url.href;
}

export function useStompFeed(onFeedEvent: () => void) {
  const clientRef = useRef<Client | null>(null);
  const callbackRef = useRef(onFeedEvent);
  callbackRef.current = onFeedEvent;

  const connect = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (clientRef.current?.active) return;

    const wsUrl = `${buildWsUrl()}?token=${encodeURIComponent(token)}`;

    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        client.subscribe("/topic/feed", () => {
          callbackRef.current();
        });
      },
    });

    client.activate();
    clientRef.current = client;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (clientRef.current?.active) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [connect]);
}
