import { prisma } from "@/lib/prisma";
import SettingsForm from "./SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await prisma.companyInfo.findFirst();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Store Settings</h1>
      <SettingsForm initialSettings={settings} />
    </div>
  );
}
