import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { appConfig } from "@/config/app";

const COOKIE_NAME = appConfig.auth.cookieName;
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "bookleaf-local-development-secret",
);

type SessionPayload = { userId: string; role: "AUTHOR" | "ADMIN" };

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${appConfig.auth.sessionDays}d`)
    .sign(secret);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: appConfig.auth.secureCookies,
    path: "/",
    maxAge: 60 * 60 * 24 * appConfig.auth.sessionDays,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
}

async function verifyToken(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const store = await cookies();
  const session = await verifyToken(store.get(COOKIE_NAME)?.value);
  if (!session) return null;
  return db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, authorCode: true, city: true },
  });
}

export async function getRequestUser(request: NextRequest) {
  const session = await verifyToken(request.cookies.get(COOKIE_NAME)?.value);
  if (!session) return null;
  return db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, authorCode: true },
  });
}
