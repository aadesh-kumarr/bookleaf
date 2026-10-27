export type RealtimeEvent =
  | { type: "realtime.connected" }
  | { type: "ticket.updated"; ticketId: string }
  | { type: "notifications.updated" };

export type RealtimeAudience = {
  roles?: Array<"AUTHOR" | "ADMIN">;
  userIds?: string[];
};

export type RealtimeEnvelope = {
  audience: RealtimeAudience;
  event: Exclude<RealtimeEvent, { type: "realtime.connected" }>;
};
