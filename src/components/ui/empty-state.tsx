/** Presents a consistent empty result with optional recovery guidance. */
export function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border-dashed bg-surface-soft px-6 py-12 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
        {text}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
