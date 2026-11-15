import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { getCurrentUser } from "@/lib/auth";
import { safeRedirectPath } from "@/lib/utils";

export const metadata = { title: "Sign in | ACUTE" };

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next: rawNext, error } = await searchParams;
  const next = safeRedirectPath(rawNext);
  if (await getCurrentUser()) redirect(next);

  return (
    <section className="container-acute flex min-h-[70vh] flex-col items-center justify-center py-12 desk:py-16">
      {error === "confirm" && (
        <p className="mb-8 text-sm text-acute-red">That confirmation link has expired. Please sign in or sign up again.</p>
      )}
      <AuthForm mode="login" next={next} />
    </section>
  );
}
