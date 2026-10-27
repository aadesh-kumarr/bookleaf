import "server-only";

import { cache } from "react";
import { SignJWT, jwtVerify } from "jose";
import { z } from "zod";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { serverConfig } from "@/config/server";

const COOKIE_NAME = serverConfig.auth.cookieName;
const authSecret = z
  .string()
  .min(32, "AUTH_SECRET must contain at least 32 characters.")
  .parse(process.env.AUTH_SECRET);
const secret = new TextEncoder().encode(authSecret);

type SessionPayload = { userId: string; role: "AUTHOR" | "ADMIN" };

/** Issues a signed, HTTP-only session cookie after successful authentication. */
export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${serverConfig.auth.sessionDays}d`)
    .sign(secret);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: serverConfig.auth.secureCookies,
    path: "/",
    maxAge: 60 * 60 * 24 * serverConfig.auth.sessionDays,
  });
}

/** Expires the current session cookie during sign-out. */
export async function clearSession() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: serverConfig.auth.secureCookies,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
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

/** Resolves and request-memoizes the user represented by the current cookie. */
export const getCurrentUser = cache(async function getCurrentUser() {
  const store = await cookies();
  const session = await verifyToken(store.get(COOKIE_NAME)?.value);
  if (!session) return null;
  return db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      authorCode: true,
      city: true,
    },
  });
});

/** Resolves an authenticated user directly from a Route Handler request. */
export async function getRequestUser(request: NextRequest) {
  const session = await verifyToken(request.cookies.get(COOKIE_NAME)?.value);
  if (!session) return null;
  return db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, authorCode: true },
  });
}
