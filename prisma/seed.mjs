import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFile } from "node:fs/promises";

const prisma = new PrismaClient();
const data = JSON.parse(
  await readFile(new URL("./bookleaf_sample_data.json", import.meta.url), "utf8"),
);

const samples = [
  {
    authorCode: "AUTH001",
    bookId: "BK001",
    subject: "Royalty payout is overdue",
    description: "My last payout was months ago and ₹3,570 is still pending. Please confirm when it will reach my account.",
    category: "ROYALTY_PAYMENTS",
    priority: "HIGH",
    status: "OPEN",
  },
  {
    authorCode: "AUTH003",
    bookId: "BK005",
    subject: "Book unavailable on Amazon",
    description: "Between Two Temples is published but Amazon India shows it as currently unavailable.",
    category: "DISTRIBUTION_AVAILABILITY",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
  },
  {
    authorCode: "AUTH007",
    bookId: "BK013",
    subject: "Cover design status update",
    description: "Could you share an update on the cover design and the next production milestone?",
    category: "BOOK_STATUS_PRODUCTION",
    priority: "LOW",
    status: "OPEN",
  },
  {
    authorCode: "AUTH009",
    bookId: "BK015",
    subject: "Typesetting taking longer than expected",
    description: "My book has been in typesetting for three weeks. Is anything needed from me?",
    category: "BOOK_STATUS_PRODUCTION",
    priority: "MEDIUM",
    status: "OPEN",
  },
  {
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
    authorCode: "AUTH005",
    bookId: "BK009",
    subject: "Royalty statement mismatch",
    description: "The latest royalty statement showed fewer paperback sales than the dashboard. I need the calculation checked for the previous quarter.",
    category: "ROYALTY_PAYMENTS",
    priority: "MEDIUM",
    status: "RESOLVED",
    assignedToAdmin: true,
    daysAgo: 18,
    response: "We reconciled the distributor report and added the missing sales to your statement. The corrected amount will appear in the next payout cycle.",
  },
  {
    authorCode: "AUTH006",
    bookId: "BK010",
    subject: "Paperback delivery is unavailable",
    description: "Customers can see the paperback listing, but delivery is unavailable for several major PIN codes. Could the distribution settings be checked?",
    category: "DISTRIBUTION_AVAILABILITY",
    priority: "HIGH",
    status: "IN_PROGRESS",
    assignedToAdmin: true,
    daysAgo: 4,
    response: "We have escalated the serviceability issue to the distribution partner and are checking the affected inventory nodes.",
  },
  {
    authorCode: "AUTH007",
    bookId: "BK012",
    subject: "Need a publication confirmation letter",
    description: "Please share a publication confirmation letter that I can submit with my university documentation.",
    category: "GENERAL_INQUIRY",
    priority: "LOW",
    status: "CLOSED",
    assignedToAdmin: true,
    daysAgo: 35,
    response: "The publication confirmation letter has been sent to your registered email address.",
  },
  {
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
    authorCode: "AUTH001",
    bookId: "BK002",
    subject: "Author name needs correction on listing",
    description: "My middle initial is missing from the online listing even though it is present in the approved metadata sheet.",
    category: "ISBN_METADATA",
    priority: "HIGH",
    status: "IN_PROGRESS",
    assignedToAdmin: true,
    daysAgo: 3,
    response: "The corrected metadata has been submitted to all retail partners. Marketplace updates normally appear within three to five working days.",
  },
];

async function main() {
  await prisma.loginAudit.deleteMany();
  await prisma.message.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();

  const authorPassword = await bcrypt.hash("bookleaf123", 10);
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      name: "Aarav Mehta",
      email: "admin@bookleaf.test",
      passwordHash: adminPassword,
      role: "ADMIN",
      city: "Delhi",
    },
  });

  const users = new Map();
  for (const author of data.authors) {
    const user = await prisma.user.create({
      data: {
        authorCode: author.author_id,
        name: author.name,
        email: author.email,
        passwordHash: authorPassword,
        phone: author.phone,
        city: author.city,
        joinedDate: new Date(`${author.joined_date}T00:00:00.000Z`),
        books: {
          create: author.books.map((book) => ({
            id: book.book_id,
            title: book.title,
            isbn: book.isbn,
            genre: book.genre,
            publicationDate: book.publication_date
              ? new Date(`${book.publication_date}T00:00:00.000Z`)
              : null,
            status: book.status,
            mrp: book.mrp,
            authorRoyaltyPerCopy: book.author_royalty_per_copy,
            totalCopiesSold: book.total_copies_sold,
            totalRoyaltyEarned: book.total_royalty_earned,
            royaltyPaid: book.royalty_paid,
            royaltyPending: book.royalty_pending,
            lastRoyaltyPayoutDate: book.last_royalty_payout_date
              ? new Date(`${book.last_royalty_payout_date}T00:00:00.000Z`)
              : null,
            printPartner: book.print_partner,
            availableOn: JSON.stringify(book.available_on),
          })),
        },
      },
    });
    users.set(author.author_id, user);
  }

  for (let index = 0; index < samples.length; index += 1) {
    const sample = samples[index];
    const author = users.get(sample.authorCode);
    await prisma.ticket.create({
      data: {
        reference: `BL-${String(index + 1).padStart(4, "0")}`,
        authorId: author.id,
        bookId: sample.bookId,
        subject: sample.subject,
        description: sample.description,
        category: sample.category,
        aiCategory: sample.category,
        priority: sample.priority,
        aiPriority: sample.priority,
        aiConfidence: 0.91,
        status: sample.status,
        assignedToId: sample.assignedToAdmin || index === 1 ? admin.id : null,
        createdAt: sample.daysAgo
          ? new Date(Date.now() - sample.daysAgo * 24 * 60 * 60 * 1000)
          : undefined,
        resolvedAt: ["RESOLVED", "CLOSED"].includes(sample.status) ? new Date() : undefined,
        messages: sample.response ? {
          create: {
            senderId: admin.id,
            body: sample.response,
          },
        } : index === 1 ? {
          create: {
            senderId: admin.id,
            body: "Thanks for flagging this. We have asked our distribution team to trigger a stock re-sync and expect the listing to recover within 24–48 hours.",
          },
        } : undefined,
      },
    });
  }
}

main()
  .then(() => console.log(`Seeded 10 authors, 18 books, 1 admin, and ${samples.length} sample tickets.`))
  .finally(() => prisma.$disconnect());
