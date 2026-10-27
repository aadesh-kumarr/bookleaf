"use client";

import { useEffect, useRef } from "react";
import type { RealtimeEvent } from "@/types/realtime";

type Listener = (event: RealtimeEvent) => void;

const listeners = new Set<Listener>();
let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempt = 0;

function isRealtimeEvent(value: unknown): value is RealtimeEvent {
  if (!value || typeof value !== "object" || !("type" in value)) return false;
  const type = (value as { type?: unknown }).type;
  return (
    type === "realtime.connected" ||
    type === "notifications.updated" ||
    (type === "ticket.updated" &&
      typeof (value as { ticketId?: unknown }).ticketId === "string")
  );
}

function notify(event: RealtimeEvent) {
  for (const listener of listeners) listener(event);
}

function scheduleReconnect() {
  if (!listeners.size || reconnectTimer) return;
  const delay = Math.min(1_000 * 2 ** reconnectAttempt, 30_000);
  reconnectAttempt += 1;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, delay);
}

function connect() {
  if (!listeners.size || socket) return;

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  socket = new WebSocket(`${protocol}//${window.location.host}/api/realtime`);

  socket.addEventListener("open", () => {
    reconnectAttempt = 0;
    notify({ type: "realtime.connected" });
  });
  socket.addEventListener("message", (message) => {
    try {
      const event: unknown = JSON.parse(String(message.data));
      if (isRealtimeEvent(event)) notify(event);
    } catch {
      // Ignore malformed messages; the server is the only expected publisher.
    }
  });
  socket.addEventListener("close", () => {
    socket = null;
    scheduleReconnect();
  });
  socket.addEventListener("error", () => socket?.close());
}

function subscribeToRealtime(listener: Listener) {
  listeners.add(listener);
  connect();

  return () => {
    listeners.delete(listener);
    if (listeners.size) return;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = null;
    reconnectAttempt = 0;
    socket?.close();
    socket = null;
  };
}

export function useRealtimeEvents(handler: (event: RealtimeEvent) => void) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(
    () => subscribeToRealtime((event) => handlerRef.current(event)),
    [],
  );
}
