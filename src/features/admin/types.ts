export type AdminTicket = {
  id: string;
  reference: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  aiCategory: string;
  aiPriority: string;
  aiConfidence: number | null;
  createdAt: string | Date;
  author: {
    name: string;
    email: string;
    phone?: string | null;
    city?: string | null;
  };
  book?: {
    title: string;
    status: string;
    royaltyPending: number;
    totalCopiesSold: number;
  } | null;
  assignedTo?: { id: string; name: string } | null;
  messages: {
    id: string;
    body: string;
    isInternal: boolean;
    createdAt: string | Date;
    sender: { name: string; role: string };
  }[];
};
