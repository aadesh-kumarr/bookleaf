import { upgradeWebSocket } from "@vercel/functions";
import type { NextRequest } from "next/server";
import { authorizeRequest } from "@/lib/authorization";
import {
  registerRealtimeConnection,
  unregisterRealtimeConnection,
} from "@/lib/realtime";

export const runtime = "nodejs";
export const maxDuration = 300;

/** Upgrades an authenticated request to the Vercel realtime WebSocket channel. */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production" && !process.env.REDIS_URL) {
    return Response.json(
      { error: { message: "Realtime service is not configured." } },
      { status: 503 },
    );
  }

  const authorization = await authorizeRequest(request);
  if (!authorization.ok) return authorization.response;

  return upgradeWebSocket((socket) => {
    registerRealtimeConnection(socket, authorization.user);
    const heartbeat = setInterval(() => socket.ping(), 30_000);

    const close = () => {
      clearInterval(heartbeat);
      unregisterRealtimeConnection(socket);
    };
    socket.on("close", close);
    socket.on("error", close);
  }, { maxPayload: 1_024 });
}
