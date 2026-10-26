import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth";
import { apiError } from "@/lib/api";
export async function GET(request: NextRequest) { const user = await getRequestUser(request); return user ? NextResponse.json({ user }) : apiError("Authentication required.", 401); }
