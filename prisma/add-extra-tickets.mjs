import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const tickets = [
  {
    reference: "BL-0005",
    authorCode: "AUTH002",
    bookId: "BK003",
    subject: "Damaged copies received by readers",
    description: "Three readers have shared photos of copies with loose binding and missing pages. Please pause the affected batch and arrange replacements.",
    category: "PRINTING_QUALITY",
    priority: "CRITICAL",
    status: "OPEN",
    daysAgo: 1,
  },
  {
    reference: "BL-0006",
    authorCode: "AUTH004",
    bookId: "BK007",
    subject: "Subtitle is incorrect on retailer listings",
    description: "The subtitle on Amazon and Flipkart does not match the approved manuscript metadata. Please correct it across all listings.",
    category: "ISBN_METADATA",
    priority: "HIGH",
    status: "OPEN",
    daysAgo: 2,
  },
  {
    reference: "BL-0007",
    authorCode: "AUTH005",
    bookId: "BK009",
    subject: "Royalty statement mismatch",
    description: "The latest royalty statement showed fewer paperback sales than the dashboard. I need the calculation checked for the previous quarter.",
    category: "ROYALTY_PAYMENTS",
    priority: "MEDIUM",
    status: "RESOLVED",
    assigned: true,
    daysAgo: 18,
    response: "We reconciled the distributor report and added the missing sales to your statement. The corrected amount will appear in the next payout cycle.",
  },
  {
    reference: "BL-0008",
    authorCode: "AUTH006",
    bookId: "BK010",
    subject: "Paperback delivery is unavailable",
    description: "Customers can see the paperback listing, but delivery is unavailable for several major PIN codes. Could the distribution settings be checked?",
    category: "DISTRIBUTION_AVAILABILITY",
    priority: "HIGH",
    status: "IN_PROGRESS",
    assigned: true,
    daysAgo: 4,
    response: "We have escalated the serviceability issue to the distribution partner and are checking the affected inventory nodes.",
  },
  {
    reference: "BL-0009",
    authorCode: "AUTH007",
    bookId: "BK012",
    subject: "Need a publication confirmation letter",
    description: "Please share a publication confirmation letter that I can submit with my university documentation.",
    category: "GENERAL_INQUIRY",
    priority: "LOW",
    status: "CLOSED",
    assigned: true,
    daysAgo: 35,
    response: "The publication confirmation letter has been sent to your registered email address.",
  },
  {
    reference: "BL-0010",
    authorCode: "AUTH008",
    bookId: "BK014",
    subject: "Book disappeared from all marketplaces",
    description: "The book was available yesterday but is now missing from Amazon, Flipkart, and the BookLeaf store. Please restore the listings urgently.",
    category: "DISTRIBUTION_AVAILABILITY",
    priority: "CRITICAL",
    status: "OPEN",
    daysAgo: 1,
  },
  {
    reference: "BL-0011",
    authorCode: "AUTH010",
    bookId: "BK018",
    subject: "Author copies have faded cover colours",
    description: "The latest author-copy shipment has noticeably faded colours compared with the approved cover proof. I can share photographs of the copies.",
    category: "PRINTING_QUALITY",
    priority: "MEDIUM",
    status: "OPEN",
    daysAgo: 6,
  },
  {
    reference: "BL-0012",
    authorCode: "AUTH001",
    bookId: "BK002",
    subject: "Author name needs correction on listing",
    description: "My middle initial is missing from the online listing even though it is present in the approved metadata sheet.",
    category: "ISBN_METADATA",
    priority: "HIGH",
    status: "IN_PROGRESS",
    assigned: true,
    daysAgo: 3,
    response: "The corrected metadata has been submitted to all retail partners. Marketplace updates normally appear within three to five working days.",
  },
];

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) throw new Error("Seeded admin user was not found.");

  let created = 0;
  for (const ticket of tickets) {
    const existing = await prisma.ticket.findUnique({ where: { reference: ticket.reference } });
    if (existing) continue;

    const author = await prisma.user.findUnique({ where: { authorCode: ticket.authorCode } });
    if (!author) throw new Error(`Author ${ticket.authorCode} was not found.`);

    await prisma.ticket.create({
      data: {
        reference: ticket.reference,
        authorId: author.id,
        bookId: ticket.bookId,
        subject: ticket.subject,
        description: ticket.description,
        category: ticket.category,
        aiCategory: ticket.category,
        priority: ticket.priority,
        aiPriority: ticket.priority,
        aiConfidence: 0.91,
        status: ticket.status,
        assignedToId: ticket.assigned ? admin.id : null,
        createdAt: new Date(Date.now() - ticket.daysAgo * 24 * 60 * 60 * 1000),
        resolvedAt: ["RESOLVED", "CLOSED"].includes(ticket.status) ? new Date() : undefined,
        messages: ticket.response ? {
          create: {
            senderId: admin.id,
            body: ticket.response,
          },
        } : undefined,
      },
    });
    created += 1;
  }

  console.log(`Added ${created} tickets; ${tickets.length - created} already existed.`);
}

main().finally(() => prisma.$disconnect());
