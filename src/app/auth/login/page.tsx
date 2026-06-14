import LoginForm from "@/components/auth/LoginForm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}
