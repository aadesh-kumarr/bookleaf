/** Defines the canonical ticket categories shared by validation and UI controls. */
export const categories = [
  "ROYALTY_PAYMENTS",
  "ISBN_METADATA",
  "PRINTING_QUALITY",
  "DISTRIBUTION_AVAILABILITY",
  "BOOK_STATUS_PRODUCTION",
  "GENERAL_INQUIRY",
] as const;

/** Defines the supported ticket priority order. */
export const priorities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
/** Defines the supported ticket lifecycle states. */
export const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

/** Maps persisted enum values to reviewer-friendly interface labels. */
export const labels: Record<string, string> = {
  ROYALTY_PAYMENTS: "Royalty & Payments",
  ISBN_METADATA: "ISBN & Metadata",
  PRINTING_QUALITY: "Printing & Quality",
  DISTRIBUTION_AVAILABILITY: "Distribution & Availability",
  BOOK_STATUS_PRODUCTION: "Book Status & Production",
  GENERAL_INQUIRY: "General Inquiry",
  IN_PROGRESS: "In progress",
  OPEN: "Open",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

/** Formats monetary values consistently in Indian rupees. */
export function formatCurrency(value: number | null | undefined) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Formats calendar dates in the product's fixed India time zone. */
export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

/** Formats date-time values consistently for support timelines. */
export function formatTime(value: string | Date | null | undefined) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}
