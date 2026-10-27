import type { Role } from "@prisma/client";

export type UserIdentity = {
  id: string;
  role: Role;
};
