import "server-only";

import { db } from "@/lib/db";
import { categories, priorities, statuses } from "@/lib/constants";

type AdminTicketFilters = {
  status?: string;
  priority?: string;
  category?: string;
  days?: string | number;
};

/** Queries the operations queue with validated status, priority, category, and age filters. */
export function getAdminTickets(filters: AdminTicketFilters = {}) {
  const days = Number(filters.days);
  const isUrgent = filters.priority === "URGENT";
  const dateFrom = [1, 7, 30, 90].includes(days)
    ? new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    : undefined;

  return db.ticket.findMany({
    where: {
      status: isUrgent
        ? { notIn: ["RESOLVED", "CLOSED"] }
        : statuses.includes(filters.status as never)
          ? (filters.status as never)
          : undefined,
      priority: isUrgent
        ? { in: ["CRITICAL", "HIGH"] }
        : priorities.includes(filters.priority as never)
          ? (filters.priority as never)
          : undefined,
      category: categories.includes(filters.category as never)
        ? (filters.category as never)
        : undefined,
      createdAt: dateFrom ? { gte: dateFrom } : undefined,
    },
    include: {
      author: { select: { name: true, email: true } },
      book: { select: { id: true, title: true } },
      assignedTo: { select: { id: true, name: true } },
      _count: {
        select: {
          messages: {
            where: {
              readAt: null,
              isInternal: false,
              sender: { role: "AUTHOR" },
            },
          },
        },
      },
    },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
  });
}
