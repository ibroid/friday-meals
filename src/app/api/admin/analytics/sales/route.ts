import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Default to current month/year if not provided
    const now = new Date();
    const month = parseInt(searchParams.get("month") || String(now.getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(now.getFullYear()));

    if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
      return NextResponse.json({ error: "Invalid month or year" }, { status: 400 });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    // Fetch DELIVERED orders in the given date range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
        status: "DELIVERED",
      },
      select: {
        total: true,
        createdAt: true,
      }
    });

    // Determine the number of days in the month
    const daysInMonth = new Date(year, month, 0).getDate();

    // Initialize array with 0s for every day
    const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
      date: String(i + 1).padStart(2, '0'),
      revenue: 0,
      ordersCount: 0,
    }));

    // Aggregate data
    orders.forEach(order => {
      // get the day of the month (1-31)
      const day = order.createdAt.getDate();
      const index = day - 1;
      
      dailyData[index].revenue += Number(order.total);
      dailyData[index].ordersCount += 1;
    });

    return NextResponse.json(dailyData);
  } catch (error) {
    console.error("Failed to fetch analytics data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
