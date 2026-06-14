import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import * as z from "zod";

const bankAccountSchema = z.object({
  bankName: z.string().min(2),
  accountNumber: z.string().min(5),
  accountHolder: z.string().min(2),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    const bankAccounts = await prisma.bankAccount.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ bankAccounts });
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = bankAccountSchema.parse(body);

    const bankAccount = await prisma.bankAccount.create({
      data: validatedData,
    });

    return NextResponse.json({ message: "Bank account created", bankAccount }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input data", errors: (error as any).errors }, { status: 422 });
    }
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
