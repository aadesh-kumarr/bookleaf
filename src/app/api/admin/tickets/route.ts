import { NextRequest, NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/authorization";
import { getAdminTickets } from "@/lib/admin-tickets";
/** Returns the filtered ticket queue for authenticated administrators. */
export async function GET(request: NextRequest) {
  const authorization = await authorizeRequest(request, "ADMIN");
  if (!authorization.ok) return authorization.response;
  const q = request.nextUrl.searchParams;
  const tickets = await getAdminTickets({
    status: q.get("status") ?? undefined,
    priority: q.get("priority") ?? undefined,
    category: q.get("category") ?? undefined,
    days: q.get("days") ?? undefined,
  });
  return NextResponse.json({ tickets });
}
