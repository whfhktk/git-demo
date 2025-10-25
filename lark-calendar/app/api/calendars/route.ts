import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { z } from "zod";

const calendarSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  color: z.string().default("#3b82f6"),
  timezone: z.string().default("UTC"),
});

export async function GET() {
  const calendars = await prisma.calendar.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(calendars);
}

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = calendarSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const created = await prisma.calendar.create({ data: parsed.data });
  return NextResponse.json(created, { status: 201 });
}
