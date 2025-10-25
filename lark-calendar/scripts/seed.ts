import "dotenv/config";
import { prisma } from "@/app/lib/prisma";

async function main() {
  // Ensure a calendar exists
  const calendar = await prisma.calendar.upsert({
    where: { id: "seed-calendar" },
    create: { id: "seed-calendar", name: "Team Calendar", timezone: "UTC" },
    update: {},
  });

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);

  await prisma.event.createMany({
    data: [
      {
        calendarId: calendar.id,
        title: "Daily Standup",
        startUtc: start,
        endUtc: end,
        allDay: false,
        rrule: "FREQ=DAILY;COUNT=30",
        timezone: "UTC",
      },
      {
        calendarId: calendar.id,
        title: "Weekly Sync",
        startUtc: start,
        endUtc: end,
        allDay: false,
        rrule: "FREQ=WEEKLY;BYDAY=MO;COUNT=12",
        timezone: "UTC",
      },
      {
        calendarId: calendar.id,
        title: "One-off: Product Demo",
        startUtc: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        endUtc: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        allDay: false,
        timezone: "UTC",
      },
    ],
  });

  console.log("Seeded sample calendar and events.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
