import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash("admin123", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@fridaymeals.com" },
    update: {},
    create: {
      email: "admin@fridaymeals.com",
      name: "Admin FridayMeals",
      password: adminPassword,
      role: "ADMIN",
      phone: "081234567890",
      addresses: "FridayMeals HQ, Jakarta",
    },
  });
  console.log(`Created admin user: ${adminUser.email} (Password: admin123)`);

  // 2. Create Dummy Products
  const dummyProducts = [
    {
      name: "Classic Chocolate Chip Cookie",
      description: "Our signature, freshly baked chocolate chip cookies. Soft on the inside, crispy on the edges.",
      price: 15000,
      stock: 50,
      imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80",
    },
    {
      name: "Double Dark Chocolate",
      description: "Rich dark chocolate cookies packed with chunks of premium Belgian chocolate.",
      price: 18000,
      stock: 30,
      imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80",
    },
    {
      name: "Oatmeal Raisin Comfort",
      description: "Classic oatmeal cookies with sweet raisins and a hint of cinnamon.",
      price: 12000,
      stock: 40,
      imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80",
    },
    {
      name: "Red Velvet Crinkle",
      description: "Vibrant red velvet cookies coated in a sweet layer of powdered sugar.",
      price: 20000,
      stock: 25,
      imageUrl: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800&q=80",
    },
    {
      name: "Matcha White Chocolate",
      description: "Earthy matcha green tea cookies balanced with sweet white chocolate chips.",
      price: 22000,
      stock: 20,
      imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80",
    },
    {
      name: "Macadamia Nut Delight",
      description: "Buttery cookies loaded with roasted macadamia nuts and white chocolate.",
      price: 25000,
      stock: 15,
      imageUrl: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800&q=80",
    }
  ];

  for (const product of dummyProducts) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name }
    });
    if (!existing) {
      const createdProduct = await prisma.product.create({
        data: product,
      });
      console.log(`Created product: ${createdProduct.name}`);
    } else {
      await prisma.product.update({
        where: { id: existing.id },
        data: { imageUrl: product.imageUrl },
      });
      console.log(`Updated product image: ${existing.name}`);
    }
  }

  // 3. Setup Default Company Info
  const companyInfo = await prisma.companyInfo.upsert({
    where: { id: "1" },
    update: {},
    create: {
      id: "1",
      name: "FridayMeals",
      address: "Jl. Sudirman No. 123, Jakarta Selatan",
      phone: "+62 811 2233 4455",
      email: "hello@fridaymeals.com",
      logoUrl: "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=400&q=80",
    },
  });
  console.log(`Created company info for: ${companyInfo.name}`);

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
