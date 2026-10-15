import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, categoryName, duration, price, digitalData, expiresAt } = body;

    // ค้นหาหรือสร้างหมวดหมู่ตามชื่อที่แอดมินพิมพ์ (เช่น Netflix, YouTube)
    const catSlug = categoryName.toLowerCase().replace(/\s+/g, '-');
    let cat = await prisma.category.findUnique({ where: { name: categoryName } });
    
    if (!cat) {
      cat = await prisma.category.create({
        data: { name: categoryName },
      });
    }

    const newProduct = await prisma.product.create({
      data: {
        title,
        categoryId: cat.id,
        duration,
        price: parseFloat(price),
        digitalData,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}