import {
  BookOpenCheck,
  MessageCircleHeart,
  ShieldCheck,
} from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-page lg:grid lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-brand p-12 text-on-brand lg:flex lg:flex-col xl:p-16">
        <div className="absolute inset-0 opacity-25 soft-grid" />
        <div className="absolute -right-20 top-16 size-80 rounded-full bg-brand-glow/40 blur-2xl" />
        <div className="absolute -bottom-32 -left-20 size-[30rem] rounded-full bg-brand-deep/45" />
        <div className="relative">
          <Brand />
          <p className="mt-20 max-w-xl text-[clamp(2.7rem,4vw,4.8rem)] font-semibold leading-[.98] tracking-[-.055em]">
            Every author deserves a clear answer.
          </p>
          <p className="mt-7 max-w-lg text-lg leading-8 text-on-brand/80">
            Track your books, understand your royalties, and stay close to the
            people bringing your story to readers.
          </p>
        </div>
        <div className="relative mt-auto grid grid-cols-3 gap-4">
          {[
            [BookOpenCheck, "18 books", "Demo catalog"],
            [MessageCircleHeart, "One place", "Every conversation"],
            [ShieldCheck, "Private", "Account-level access"],
          ].map(([Icon, title, text]) => {
            const C = Icon as typeof BookOpenCheck;
            return (
              <div
                key={String(title)}
                className="rounded-2xl border border-on-brand/20 bg-on-brand/10 p-4 backdrop-blur"
              >
                <C size={22} />
                <p className="mt-4 font-semibold">{String(title)}</p>
                <p className="mt-1 text-xs text-on-brand/70">{String(text)}</p>
              </div>
            );
          })}
        </div>
      </section>
      <LoginForm />
    </main>
  );
}
