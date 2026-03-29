import { SectionCard } from "@/components/section-card";
import { SignInForm } from "@/components/sign-in-form";

export default function SignInPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8">
      <SectionCard
        eyebrow="Auth"
        title="Sign in to Luma"
        description="Use Supabase email auth for a real account, or leave env vars unset and the app will run in demo mode."
      >
        <SignInForm />
      </SectionCard>
    </div>
  );
}
