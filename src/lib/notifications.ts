import "server-only";

import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { UserIdentity } from "@/types/auth";

type MessageStore = Pick<Prisma.TransactionClient, "message">;

/** Counts unread public messages addressed to the current role or author. */
export function getUnreadMessageCount(user: UserIdentity) {
  return db.message.count({
    where: {
      readAt: null,
      isInternal: false,
      sender: { role: user.role === "ADMIN" ? "AUTHOR" : "ADMIN" },
      ticket: user.role === "AUTHOR" ? { authorId: user.id } : undefined,
    },
  });
}

/** Marks only caller-visible incoming messages as read for one ticket. */
export function markTicketMessagesRead(
  ticketId: string,
  user: UserIdentity,
  store: MessageStore = db,
) {
  return store.message.updateMany({
    where: {
      ticketId,
      readAt: null,
      isInternal: false,
      sender: { role: user.role === "ADMIN" ? "AUTHOR" : "ADMIN" },
      ticket: user.role === "AUTHOR" ? { authorId: user.id } : undefined,
    },
    data: { readAt: new Date() },
  });
}
