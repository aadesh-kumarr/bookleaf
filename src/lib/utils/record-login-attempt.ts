import type { Role } from "@prisma/client";
import { db } from "@/lib/db";

type LoginAttempt = {
  email: string;
  success: boolean;
  userId?: string;
  role?: Role;
  reason?: "invalid_input" | "invalid_credentials";
};

/**
 * Persists a minimal authentication audit event without blocking login.
 * Passwords, cookies, tokens, IP addresses, and request headers are never stored.
 */
export async function recordLoginAttempt(attempt: LoginAttempt): Promise<void> {
  const attemptedEmail = attempt.email.trim().toLowerCase().slice(0, 320) || "not supplied";

  try {
    await db.loginAudit.create({
      data: {
        attemptedEmail,
        success: attempt.success,
        reason: attempt.reason,
        role: attempt.role,
        userId: attempt.userId,
      },
    });
  } catch (error) {
    // Authentication should remain available if audit persistence is temporarily down.
    console.error("Unable to persist login audit event.", error);
  }
}
