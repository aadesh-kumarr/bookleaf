import "server-only";

import crypto from "node:crypto";
import WebSocket from "ws";
import { createRedisStreamClient, getRedisClient } from "@/lib/redis";
import type { UserIdentity } from "@/types/auth";
import type { RealtimeEnvelope } from "@/types/realtime";

const streamKey = "bookleaf:realtime:v1";
const streamBlockMs = 5_000;
const streamMaxLength = 1_000;

type RealtimeHub = {
  connections: Map<WebSocket, UserIdentity>;
  instanceId: string;
  streamClient: ReturnType<typeof createRedisStreamClient>;
  streaming: boolean;
  cursor: string;
};

const globalForRealtime = globalThis as unknown as {
  bookleafRealtimeHub?: RealtimeHub;
};

const hub =
  globalForRealtime.bookleafRealtimeHub ??
  (globalForRealtime.bookleafRealtimeHub = {
    connections: new Map(),
    instanceId: crypto.randomUUID(),
    streamClient: null,
    streaming: false,
    cursor: "$",
  });

function canReceive(user: UserIdentity, envelope: RealtimeEnvelope) {
  return Boolean(
    envelope.audience.roles?.includes(user.role) ||
      envelope.audience.userIds?.includes(user.id),
  );
}

function broadcast(envelope: RealtimeEnvelope) {
  const payload = JSON.stringify(envelope.event);
  for (const [socket, user] of hub.connections) {
    if (socket.readyState === WebSocket.OPEN && canReceive(user, envelope)) {
      socket.send(payload);
    }
  }
}

function parseEnvelope(value?: string): RealtimeEnvelope | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<RealtimeEnvelope>;
    const roles = parsed.audience?.roles;
    const userIds = parsed.audience?.userIds;
    const validAudience =
      (Array.isArray(roles) &&
        roles.length > 0 &&
        roles.every((role) => role === "AUTHOR" || role === "ADMIN")) ||
      (Array.isArray(userIds) &&
        userIds.length > 0 &&
        userIds.every((userId) => typeof userId === "string"));
    const validEvent =
      parsed.event?.type === "notifications.updated" ||
      (parsed.event?.type === "ticket.updated" &&
        typeof parsed.event.ticketId === "string");
    return validAudience && validEvent ? (parsed as RealtimeEnvelope) : null;
  } catch {
    return null;
  }
}

function fieldsToObject(values: string[]) {
  const fields: Record<string, string> = {};
  for (let index = 0; index + 1 < values.length; index += 2) {
    fields[values[index]] = values[index + 1];
  }
  return fields;
}

async function runStreamLoop() {
  const client = hub.streamClient;
  if (!client) return;

  while (hub.streaming) {
    try {
      const result = (await client.xread(
        "BLOCK",
        streamBlockMs,
        "STREAMS",
        streamKey,
        hub.cursor,
      )) as Array<[string, Array<[string, string[]]>]> | null;

      if (!result) continue;
      for (const [, entries] of result) {
        for (const [id, values] of entries) {
          hub.cursor = id;
          const fields = fieldsToObject(values);
          if (fields.origin === hub.instanceId) continue;
          const envelope = parseEnvelope(fields.payload);
          if (envelope) broadcast(envelope);
        }
      }
    } catch (error) {
      if (!hub.streaming) return;
      console.error("Realtime Redis stream failed.", error);
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }
  }
}

function startStream() {
  if (hub.streaming || !process.env.REDIS_URL) return;
  hub.streaming = true;
  hub.cursor = "$";
  hub.streamClient = createRedisStreamClient();
  void runStreamLoop();
}

function stopStream() {
  if (hub.connections.size || !hub.streaming) return;
  hub.streaming = false;
  const client = hub.streamClient;
  hub.streamClient = null;
  if (client) void client.quit().catch(() => client.disconnect());
}

/** Registers an authenticated socket and starts cross-instance event consumption. */
export function registerRealtimeConnection(
  socket: WebSocket,
  user: UserIdentity,
) {
  hub.connections.set(socket, user);
  startStream();
}

/** Removes a closed socket and releases the stream client when the hub becomes idle. */
export function unregisterRealtimeConnection(socket: WebSocket) {
  hub.connections.delete(socket);
  stopStream();
}

/** Delivers a targeted invalidation locally and through the shared Redis Stream. */
export async function publishRealtimeEvent(envelope: RealtimeEnvelope) {
  broadcast(envelope);
  const redis = getRedisClient();
  if (!redis) return;

  try {
    await redis.xadd(
      streamKey,
      "MAXLEN",
      "~",
      streamMaxLength,
      "*",
      "origin",
      hub.instanceId,
      "payload",
      JSON.stringify(envelope),
    );
  } catch (error) {
    console.error("Unable to publish realtime event.", error);
  }
}

/** Notifies administrators and the owning author that a ticket should be refetched. */
export function ticketUpdatedEvent(ticketId: string, authorId: string) {
  return publishRealtimeEvent({
    audience: { roles: ["ADMIN"], userIds: [authorId] },
    event: { type: "ticket.updated", ticketId },
  });
}

/** Notifies one user that their unread-message count should be refetched. */
export function notificationsUpdatedEvent(userId: string) {
  return publishRealtimeEvent({
    audience: { userIds: [userId] },
    event: { type: "notifications.updated" },
  });
}
