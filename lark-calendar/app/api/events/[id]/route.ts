import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { z } from "zod";
import { DateTime } from "luxon";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  startUtc: z.string().datetime().optional(),
  endUtc: z.string().datetime().optional(),
  allDay: z.boolean().optional(),
  rrule: z.string().nullable().optional(),
  exdatesJson: z.string().nullable().optional(),
  rdatesJson: z.string().nullable().optional(),
  remindersJson: z.string().nullable().optional(),
  visibility: z.string().optional(),
  organizer: z.string().nullable().optional(),
  attendeesJson: z.string().nullable().optional(),
  conferenceUrl: z.string().nullable().optional(),
  timezone: z.string().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const event = await prisma.event.findUnique({ where: { id: params.id } });
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(event);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const json = await req.json();
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  if (data.startUtc && data.endUtc) {
    const start = DateTime.fromISO(data.startUtc, { zone: "utc" });
    const end = DateTime.fromISO(data.endUtc, { zone: "utc" });
    if (!start.isValid || !end.isValid || end <= start) {
      return NextResponse.json({ error: "Invalid start/end" }, { status: 400 });
    }
  }

  try {
    const updated = await prisma.event.update({
      where: { id: params.id },
      data: {
        ...data,
        startUtc: data.startUtc ? DateTime.fromISO(data.startUtc, { zone: "utc" }).toJSDate() : undefined,
        endUtc: data.endUtc ? DateTime.fromISO(data.endUtc, { zone: "utc" }).toJSDate() : undefined,
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.event.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
