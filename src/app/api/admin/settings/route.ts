import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import * as z from "zod";

const settingsSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  socialMedia: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const settings = await prisma.companyInfo.findFirst();
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = settingsSchema.parse(body);

    const existingSettings = await prisma.companyInfo.findFirst();

    let settings;
    if (existingSettings) {
      settings = await prisma.companyInfo.update({
        where: { id: existingSettings.id },
        data,
      });
    } else {
      settings = await prisma.companyInfo.create({
        data,
      });
    }

    return NextResponse.json({ message: "Settings updated successfully", settings }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input data", errors: (error as any).errors }, { status: 422 });
    }
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
