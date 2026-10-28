import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

/** Redirects the root URL to the caller's role-specific landing page. */
export default async function Home() {
  const user = await getCurrentUser();
  redirect(user ? (user.role === "ADMIN" ? "/admin" : "/author") : "/login");
}
