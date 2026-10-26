import { Skeleton } from "@/components/ui/skeleton";

export function TicketRowsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading tickets" className="space-y-3">
      <span className="sr-only">Loading tickets</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="rounded-xl border border-[#eee5e5] p-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="mt-3 h-4 w-3/5" />
          <Skeleton className="mt-2 h-3 w-2/5" />
        </div>
      ))}
    </div>
  );
}

export function TicketDetailSkeleton() {
  return (
    <div role="status" aria-label="Loading ticket" className="animate-in fade-in">
      <span className="sr-only">Loading ticket</span>
      <Skeleton className="h-4 w-28" />
      <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#eadfdf] bg-white p-6">
            <div className="flex gap-2"><Skeleton className="h-6 w-16 rounded-full"/><Skeleton className="h-6 w-20 rounded-full"/></div>
            <Skeleton className="mt-5 h-8 w-2/3" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
          </div>
          <div className="rounded-2xl border border-[#eadfdf] bg-white p-6">
            <Skeleton className="h-5 w-44" />
            <div className="mt-6 space-y-5">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#eadfdf] bg-white p-6"><Skeleton className="h-5 w-24"/><Skeleton className="mt-5 h-11 w-full"/><Skeleton className="mt-4 h-11 w-full"/></div>
          <div className="rounded-2xl border border-[#eadfdf] bg-white p-6"><Skeleton className="h-5 w-32"/><Skeleton className="mt-5 h-24 w-full"/></div>
        </div>
      </div>
    </div>
  );
}

export function PortalPageSkeleton() {
  return (
    <div role="status" aria-label="Loading page">
      <span className="sr-only">Loading page</span>
      <Skeleton className="h-4 w-36" />
      <Skeleton className="mt-3 h-10 w-72 max-w-full" />
      <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-28 rounded-2xl" />)}
      </div>
      <div className="mt-6 rounded-2xl border border-[#eadfdf] bg-white p-6">
        <Skeleton className="h-6 w-44" />
        <div className="mt-6"><TicketRowsSkeleton rows={4} /></div>
      </div>
    </div>
  );
}
