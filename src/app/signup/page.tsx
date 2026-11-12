import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { getCurrentUser } from "@/lib/auth";
import { safeRedirectPath } from "@/lib/utils";

export const metadata = { title: "Create account — ACUTE" };

type Props = { searchParams: Promise<{ next?: string; email?: string }> };

export default async function SignupPage({ searchParams }: Props) {
  const params = await searchParams;
  const next = safeRedirectPath(params.next);
  if (await getCurrentUser()) redirect(next);

  return (
    <section className="container-acute flex min-h-[80vh] flex-col items-center justify-center py-32">
      <AuthForm mode="signup" next={next} defaultEmail={params.email} />
    </section>
  );
}
