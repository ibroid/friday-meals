import { prisma } from "@/lib/prisma";
import UserList from "./UserList";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { orders: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Users Directory</h1>
      <UserList initialUsers={users as any} />
    </div>
  );
}
