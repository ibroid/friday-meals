import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BankAccountList from "./BankAccountList";

export default async function AdminBankAccountsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const bankAccounts = await prisma.bankAccount.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rekening Bank</h1>
        <p className="text-muted-foreground">
          Kelola nomor rekening bank untuk metode pembayaran Transfer Bank.
        </p>
      </div>

      <BankAccountList initialBankAccounts={bankAccounts} />
    </div>
  );
}
