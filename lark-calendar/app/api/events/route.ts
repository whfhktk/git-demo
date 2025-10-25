import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { z } from "zod";
import { DateTime } from "luxon";
import { expandEventOccurrences } from "@/app/lib/recurrence";

const baseEventSchema = z.object({
  calendarId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  startUtc: z.string().datetime(),
  endUtc: z.string().datetime(),
  allDay: z.boolean().default(false),
  rrule: z.string().nullable().optional(),
  exdatesJson: z.string().nullable().optional(),
  rdatesJson: z.string().nullable().optional(),
  remindersJson: z.string().nullable().optional(),
  visibility: z.string().default("default"),
  organizer: z.string().nullable().optional(),
  attendeesJson: z.string().nullable().optional(),
  conferenceUrl: z.string().nullable().optional(),
  timezone: z.string().default("UTC"),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const calendarId = searchParams.get("calendarId");
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const expand = searchParams.get("expand") === "1";

  if (!calendarId) {
    return NextResponse.json({ error: "calendarId is required" }, { status: 400 });
  }

  const where = { calendarId } as const;
  const events = await prisma.event.findMany({ where, orderBy: { startUtc: "asc" } });

  if (!expand) return NextResponse.json(events);

  if (!start || !end) {
    return NextResponse.json({ error: "start and end are required when expand=1" }, { status: 400 });
  }

  const windowStartUtc = DateTime.fromISO(start, { zone: "utc" }).toJSDate();
  const windowEndUtc = DateTime.fromISO(end, { zone: "utc" }).toJSDate();

  const occurrences = events.flatMap((e) =>
    expandEventOccurrences(
      {
        id: e.id,
        title: e.title,
        startUtc: e.startUtc,
        endUtc: e.endUtc,
        allDay: e.allDay,
        rrule: e.rrule ?? undefined,
        exdatesJson: e.exdatesJson ?? undefined,
        rdatesJson: e.rdatesJson ?? undefined,
        timezone: e.timezone ?? undefined,
      },
      windowStartUtc,
      windowEndUtc
    )
  );

  return NextResponse.json(occurrences);
}

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = baseEventSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const start = DateTime.fromISO(data.startUtc, { zone: "utc" });
  const end = DateTime.fromISO(data.endUtc, { zone: "utc" });
  if (!start.isValid || !end.isValid || end <= start) {
    return NextResponse.json({ error: "Invalid start/end" }, { status: 400 });
  }

  const created = await prisma.event.create({
    data: {
      calendarId: data.calendarId,
      title: data.title,
      description: data.description ?? undefined,
      location: data.location ?? undefined,
      startUtc: start.toJSDate(),
      endUtc: end.toJSDate(),
      allDay: data.allDay ?? false,
      rrule: data.rrule ?? undefined,
      exdatesJson: data.exdatesJson ?? undefined,
      rdatesJson: data.rdatesJson ?? undefined,
      remindersJson: data.remindersJson ?? undefined,
      visibility: data.visibility ?? "default",
      organizer: data.organizer ?? undefined,
      attendeesJson: data.attendeesJson ?? undefined,
      conferenceUrl: data.conferenceUrl ?? undefined,
      timezone: data.timezone ?? "UTC",
    },
  });
  return NextResponse.json(created, { status: 201 });
}
