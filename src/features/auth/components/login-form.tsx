"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage, requestJson } from "@/lib/api-client";

/** Handles credential submission and role-aware post-login navigation. */
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body = await requestJson<{ user: { role: "ADMIN" | "AUTHOR" } }>(
        "/api/auth/login",
        {
          method: "POST",
          json: { email, password },
        },
      );
      router.push(body.user.role === "ADMIN" ? "/admin" : "/author");
      router.refresh();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Unable to reach Author Care. Please try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
      <div className="w-full max-w-md">
        <div className="mb-10 lg:hidden">
          <Brand />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[.18em] text-brand-strong">
          Welcome back
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-.045em]">
          Sign in to Author Care
        </h1>
        <p className="mt-3 leading-7 text-text-muted">
          Enter your BookLeaf account credentials to continue.
        </p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-semibold">Email address</span>
            <Input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="email"
              required
              className="mt-2 h-12"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Password</span>
            <Input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
              required
              className="mt-2 h-12"
            />
          </label>
          {error && (
            <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}
          <Button disabled={loading} size="lg" className="w-full">
            {loading ? "Signing in…" : "Sign in"}
            <ArrowRight size={18} />
          </Button>
        </form>
      </div>
    </section>
  );
}
