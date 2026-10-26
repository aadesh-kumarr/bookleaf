import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3" aria-label="BookLeaf Author Care home">
      <span className="grid size-10 place-items-center rounded-xl bg-[#f15d6f] text-white shadow-[0_8px_24px_rgba(241,93,111,.28)]">
        <svg viewBox="0 0 40 40" className="size-7" aria-hidden="true"><path d="M27.8 7.8C18 8.4 10.7 14 10.7 22.2c0 4.3 2.5 7.4 6.4 8.6 1-5.7 4-11.3 9.6-16.1-3.9 4.8-6.5 10-7.5 15.7 7.5-1.5 11.7-8.3 8.6-22.6Z" fill="currentColor"/></svg>
      </span>
      {!compact && <span className="leading-none"><strong className="block text-[20px] font-semibold tracking-[-.03em]">BookLeaf</strong><span className="mt-1 block text-[10px] font-medium uppercase tracking-[.2em] text-[#817b80]">Author Care</span></span>}
    </Link>
  );
}
