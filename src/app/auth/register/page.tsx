import RegisterForm from "@/components/auth/RegisterForm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <RegisterForm />
    </div>
  );
}
