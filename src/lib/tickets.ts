import "server-only";

import { db } from "@/lib/db";
import type { UserIdentity } from "@/types/auth";

/** Lists tickets within the caller's role and author-ownership boundary. */
export function getTicketsForUser(user: UserIdentity) {
  return db.ticket.findMany({
    where: user.role === "ADMIN" ? {} : { authorId: user.id },
    include: {
      book: { select: { id: true, title: true } },
      author: { select: { name: true, email: true } },
      assignedTo: { select: { id: true, name: true } },
      messages: {
        where: user.role === "ADMIN" ? {} : { isInternal: false },
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { name: true, role: true } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

/** Loads one ticket while hiding internal notes and unauthorized author records. */
export function getTicketForUser(id: string, user: UserIdentity) {
  return db.ticket.findFirst({
    where: { id, ...(user.role === "AUTHOR" ? { authorId: user.id } : {}) },
    include: {
      book: true,
      author: {
        select: { id: true, name: true, email: true, phone: true, city: true },
      },
      assignedTo: { select: { id: true, name: true } },
      messages: {
        where: user.role === "AUTHOR" ? { isInternal: false } : {},
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { name: true, role: true } } },
      },
    },
  });
}
