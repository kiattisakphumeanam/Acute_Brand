import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Admin | ACUTE" };

/** Guards every page under /admin. Middleware handles "not signed in"; this handles "not an admin". */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <div className="container-acute py-12 desk:py-16">{children}</div>;
}
