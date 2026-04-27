import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      noimageindex: true,
      follow: false,
    },
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headerStore = await headers();
  const pathname = headerStore.get("x-next-url") ?? headerStore.get("x-invoke-path") ?? "";

  if (pathname !== "/admin/login" && !pathname.startsWith("/admin/login/")) {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      redirect("/admin/login");
    }
  }

  return children;
}
