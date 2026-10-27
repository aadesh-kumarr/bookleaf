import { Badge, type BadgeVariant } from "@/components/ui/badge";

const statusVariants: Record<string, BadgeVariant> = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
  OPEN: "open",
  IN_PROGRESS: "progress",
  RESOLVED: "resolved",
  CLOSED: "closed",
};

export function StatusBadge({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const label = value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

  return (
    <Badge variant={statusVariants[value] ?? "default"} className={className}>
      {label}
    </Badge>
  );
}
