import type { TicketCategory } from "@prisma/client";

const common = `BookLeaf Publishing operates in India and the US. Authors are partners. Be empathetic, professional, specific, and accountable. Acknowledge the concern, give concrete dates or timelines, and finish with a clear next step.`;

const sections: Record<TicketCategory, string> = {
  ROYALTY_PAYMENTS: `Royalty policy: Authors receive 80% of net profit; BookLeaf receives 20%. Net profit is MRP minus printing cost, platform commission, and shipping. Royalties are calculated quarterly and paid within 45 days after quarter end. The minimum payout is ₹1,000; smaller balances roll over. Payments use the bank account linked in the dashboard. Offer a detailed platform-level breakdown.`,
  ISBN_METADATA: `Every BookLeaf title receives a unique ISBN registered under BookLeaf's imprint. Authors who want their own imprint obtain an ISBN independently. Duplicate or mismatched ISBN reports are high-priority and must be escalated to production with a 48-hour resolution target.`,
  PRINTING_QUALITY: `Most orders are printed in-house in Delhi; overflow or special formats go to Repro India or Epitome Books. Standard turnaround is 5–7 business days. After photos verify misprints, binding defects, or color issues, BookLeaf arranges a free reprint.`,
  DISTRIBUTION_AVAILABILITY: `Books may be listed on Amazon India, Flipkart, Amazon US, Amazon UK, and the BookLeaf Store. New listings take 7–10 business days after publication. An unavailable listing usually indicates a stock sync issue; the team can trigger a re-sync within 24–48 hours.`,
  BOOK_STATUS_PRODUCTION: `Production stages: Manuscript Received → Editing → Cover Design → Typesetting → Proofreading → ISBN Assignment → Printing → Distribution Setup → Published & Live. Delays most often occur at cover approval and proofreading revisions. Explain the actual stage and provide a specific updated timeline without blaming the author.`,
  GENERAL_INQUIRY: `BookLeaf handles cover design, typesetting, ISBN assignment, printing, distribution, and royalties. Metadata updates for live books can be submitted through the dashboard or support and usually reflect on platforms within 3–5 business days.`,
};

/** Returns the smallest policy section relevant to the selected ticket category. */
export function getKnowledge(category: TicketCategory) {
  return `${common}\n\n${sections[category]}`;
}
