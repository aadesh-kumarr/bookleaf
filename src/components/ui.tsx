import { Badge as ShadcnBadge } from "@/components/ui/badge";

export function Badge({ value, className }: { value: string; className?: string }) {
  const tone = value === "CRITICAL" ? "bg-red-100 text-red-700" : value === "HIGH" ? "bg-orange-100 text-orange-700" : value === "MEDIUM" ? "bg-amber-100 text-amber-700" : value === "LOW" ? "bg-slate-100 text-slate-600" : value === "OPEN" ? "bg-[#fff0ed] text-[#c74256]" : value === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" : value === "RESOLVED" ? "bg-emerald-100 text-emerald-700" : value === "CLOSED" ? "bg-slate-200 text-slate-600" : "bg-[#f7f2f2] text-[#655e63]";
  const label = value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
  return <ShadcnBadge className={`${tone} ${className ?? ""}`}>{label}</ShadcnBadge>;
}

export function StatCard({ label, value, detail, icon }: { label: string; value: string; detail?: string; icon: React.ReactNode }) {
  return <div className="rounded-2xl border border-[#eadfdf] bg-white p-5 shadow-[0_12px_40px_rgba(63,32,38,.05)]"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.12em] text-[#8a8388]">{label}</p><p className="mt-2 text-3xl font-semibold tracking-[-.04em]">{value}</p>{detail && <p className="mt-1 text-sm text-[#746f75]">{detail}</p>}</div><span className="grid size-10 place-items-center rounded-xl bg-[#fff0ed] text-[#e65265]">{icon}</span></div></div>;
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-[#e5cccc] bg-[#fff9f7] px-6 py-12 text-center"><p className="font-semibold">{title}</p><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#746f75]">{text}</p>{action && <div className="mt-5">{action}</div>}</div>;
}
