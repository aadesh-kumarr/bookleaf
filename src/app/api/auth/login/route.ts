import bcrypt from "bcryptjs";
import { z } from "zod";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError } from "@/lib/api";
import { createSession } from "@/lib/auth";
import { recordLoginAttempt } from "@/lib/utils/record-login-attempt";

const schema = z.object({ email: z.email().transform((v) => v.toLowerCase()), password: z.string().min(6).max(100) });
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    await recordLoginAttempt({
      email: typeof body?.email === "string" ? body.email : "Not supplied",
      success: false,
      reason: "invalid_input",
    });
    return apiError("Enter a valid email and password.", 422, parsed.error.flatten());
  }
  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    await recordLoginAttempt({
      email: parsed.data.email,
      success: false,
      reason: "invalid_credentials",
    });
    return apiError("Incorrect email or password.", 401);
  }
  await createSession({ userId: user.id, role: user.role });
  await recordLoginAttempt({
    email: user.email,
    success: true,
    role: user.role,
    userId: user.id,
  });
  return NextResponse.json({ user: { id: user.id, name: user.name, role: user.role } });
}
