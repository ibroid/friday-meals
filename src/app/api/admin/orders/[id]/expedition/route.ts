import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const expedition = await prisma.expedition.findUnique({
      where: { orderId: id },
    });
    return NextResponse.json({ expedition });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch expedition data" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    // First, check if order exists
    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const expedition = await prisma.expedition.create({
      data: {
        orderId: id,
        alamatTujuan: body.alamatTujuan || order.shippingAddress,
        nomorTelepon: body.nomorTelepon || order.phone,
        namaTujuan: body.namaTujuan || order.user.name,
        nomorResi: body.nomorResi || null,
        jenisEkspedisi: body.jenisEkspedisi || null,
        hasilFotoUrl: body.hasilFotoUrl || null,
      },
    });
    return NextResponse.json({ expedition }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create expedition data" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const expedition = await prisma.expedition.update({
      where: { orderId: id },
      data: {
        alamatTujuan: body.alamatTujuan,
        nomorTelepon: body.nomorTelepon,
        namaTujuan: body.namaTujuan,
        nomorResi: body.nomorResi,
        jenisEkspedisi: body.jenisEkspedisi,
        hasilFotoUrl: body.hasilFotoUrl,
      },
    });
    return NextResponse.json({ expedition });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update expedition data" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.expedition.delete({
      where: { orderId: id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete expedition data" }, { status: 500 });
  }
}
