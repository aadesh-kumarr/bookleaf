import "server-only";

import type { Role } from "@prisma/client";
import type { NextRequest } from "next/server";
import { apiError } from "@/lib/api";
import { getRequestUser } from "@/lib/auth";

/** Enforces authentication and an optional role at every protected API boundary. */
export async function authorizeRequest(
  request: NextRequest,
  requiredRole?: Role,
) {
  const user = await getRequestUser(request);
  if (!user) {
    return {
      ok: false as const,
      response: apiError("Authentication required.", 401),
    };
  }
  if (requiredRole && user.role !== requiredRole) {
    const roleName = requiredRole === "ADMIN" ? "Admin" : "Author";
    return {
      ok: false as const,
      response: apiError(`${roleName} access required.`, 403),
    };
  }
  return { ok: true as const, user };
}
