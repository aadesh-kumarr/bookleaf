"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpenCheck, MessageCircleHeart, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { appConfig } from "@/config/app";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>(appConfig.auth.demo.author.email);
  const [password, setPassword] = useState<string>(appConfig.auth.demo.author.password);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setLoading(true);
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const body = await response.json();
    if (!response.ok) { setError(body.error?.message ?? "Unable to sign in"); setLoading(false); return; }
    router.push(body.user.role === "ADMIN" ? "/admin" : "/author"); router.refresh();
  }

  function selectDemo(role: "author" | "admin") {
    const account = appConfig.auth.demo[role]; setEmail(account.email); setPassword(account.password);
  }

  return <main className="min-h-screen bg-[#fffaf8] lg:grid lg:grid-cols-[1.05fr_.95fr]">
    <section className="relative hidden overflow-hidden bg-[#f15d6f] p-12 text-white lg:flex lg:flex-col xl:p-16">
      <div className="absolute inset-0 opacity-25 soft-grid"/><div className="absolute -right-20 top-16 size-80 rounded-full bg-[#ffbfc7]/40 blur-2xl"/><div className="absolute -bottom-32 -left-20 size-[30rem] rounded-full bg-[#c83d51]/45"/>
      <div className="relative"><Brand/><p className="mt-20 max-w-xl text-[clamp(2.7rem,4vw,4.8rem)] font-semibold leading-[.98] tracking-[-.055em]">Every author deserves a clear answer.</p><p className="mt-7 max-w-lg text-lg leading-8 text-white/80">Track your books, understand your royalties, and stay close to the people bringing your story to readers.</p></div>
      <div className="relative mt-auto grid grid-cols-3 gap-4">{[[BookOpenCheck,"18 books","Demo catalog"],[MessageCircleHeart,"One place","Every conversation"],[ShieldCheck,"Private","Account-level access"]].map(([Icon,title,text]) => { const C=Icon as typeof BookOpenCheck; return <div key={String(title)} className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur"><C size={22}/><p className="mt-4 font-semibold">{String(title)}</p><p className="mt-1 text-xs text-white/70">{String(text)}</p></div>; })}</div>
    </section>
    <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
      <div className="w-full max-w-md"><div className="mb-10 lg:hidden"><Brand/></div><p className="text-sm font-semibold uppercase tracking-[.18em] text-[#e04d61]">Welcome back</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.045em]">Sign in to Author Care</h1><p className="mt-3 leading-7 text-[#746f75]">Use a seeded author or admin account to explore the portal.</p>
        <form onSubmit={submit} className="mt-8 space-y-5"><label className="block"><span className="text-sm font-semibold">Email address</span><Input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required className="mt-2 h-12"/></label><label className="block"><span className="text-sm font-semibold">Password</span><Input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required className="mt-2 h-12"/></label>{error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<Button disabled={loading} size="lg" className="w-full">{loading ? "Signing in…" : "Sign in"}<ArrowRight size={18}/></Button></form>
        <div className="mt-7 border-t border-[#eadfdf] pt-6"><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#8b8589]">Demo shortcuts</p><div className="mt-3 flex gap-3"><button onClick={()=>selectDemo("author")} className="flex-1 rounded-xl border border-[#eadfdf] bg-white px-4 py-3 text-sm font-semibold hover:border-[#f15d6f]">Author account</button><button onClick={()=>selectDemo("admin")} className="flex-1 rounded-xl border border-[#eadfdf] bg-white px-4 py-3 text-sm font-semibold hover:border-[#f15d6f]">Admin account</button></div></div>
      </div>
    </section>
  </main>;
}
