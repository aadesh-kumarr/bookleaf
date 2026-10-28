/** Displays one dashboard metric with a contextual icon and helper text. */
export function StatCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.12em] text-text-caption">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-[-.04em]">
            {value}
          </p>
          {detail && <p className="mt-1 text-sm text-text-muted">{detail}</p>}
        </div>
        <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand-icon">
          {icon}
        </span>
      </div>
    </div>
  );
}
