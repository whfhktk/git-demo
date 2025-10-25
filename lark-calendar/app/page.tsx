"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  Views,
  type Event as RBCEvent,
} from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek,
  getDay,
} from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

type Occurrence = {
  eventId: string;
  title: string;
  startUtc: string | Date;
  endUtc: string | Date;
  allDay: boolean;
};

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function Home() {
  const [events, setEvents] = useState<RBCEvent[]>([]);
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [permissionChecked, setPermissionChecked] = useState(false);

  useEffect(() => {
    async function ensureCalendar() {
      const res = await fetch("/api/calendars");
      const calendars = await res.json();
      if (Array.isArray(calendars) && calendars.length > 0) {
        setCalendarId(calendars[0].id);
        return calendars[0].id as string;
      }
      const createdRes = await fetch("/api/calendars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "My Calendar", color: "#3b82f6", timezone: "UTC" }),
      });
      const created = await createdRes.json();
      setCalendarId(created.id);
      return created.id as string;
    }
    ensureCalendar();
  }, []);

  // Request Notification permission
  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      setPermissionChecked(true);
      return;
    }
    Notification.requestPermission().finally(() => setPermissionChecked(true));
  }, []);

  const range = useMemo(() => {
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    const end = new Date();
    end.setMonth(end.getMonth() + 2);
    return { start, end };
  }, []);

  useEffect(() => {
    if (!calendarId) return;
    async function load() {
      const url = new URL(window.location.origin + "/api/events");
      url.searchParams.set("calendarId", calendarId);
      url.searchParams.set("expand", "1");
      url.searchParams.set("start", range.start.toISOString());
      url.searchParams.set("end", range.end.toISOString());
      const res = await fetch(url.toString());
      const data: Occurrence[] = await res.json();
      setEvents(
        data.map((o) => ({
          title: o.title,
          start: new Date(o.startUtc),
          end: new Date(o.endUtc),
          allDay: o.allDay,
          resource: { eventId: o.eventId },
        }))
      );
    }
    load();
  }, [calendarId, range.end, range.start]);

  async function handleSelectSlot({ start, end }: { start: Date; end: Date }) {
    if (!calendarId) return;
    const title = window.prompt("Event title?");
    if (!title) return;
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        calendarId,
        title,
        startUtc: start.toISOString(),
        endUtc: end.toISOString(),
        allDay: false,
        timezone: "UTC",
      }),
    });
    // reload
    const url = new URL(window.location.origin + "/api/events");
    url.searchParams.set("calendarId", calendarId);
    url.searchParams.set("expand", "1");
    url.searchParams.set("start", range.start.toISOString());
    url.searchParams.set("end", range.end.toISOString());
    const res = await fetch(url.toString());
    const data: Occurrence[] = await res.json();
    setEvents(
      data.map((o) => ({
        title: o.title,
        start: new Date(o.startUtc),
        end: new Date(o.endUtc),
        allDay: o.allDay,
        resource: { eventId: o.eventId },
      }))
    );
  }

  return (
    <div className="min-h-screen p-4">
      <h1 className="mb-4 text-2xl font-semibold">Lark-like Calendar</h1>
      <div className="h-[80vh] rounded border">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          defaultView={Views.MONTH}
          popup
          selectable
          onSelectSlot={handleSelectSlot}
        />
      </div>
      {permissionChecked && (
        <ReminderWatcher events={events} />
      )}
    </div>
  );
}

function ReminderWatcher({ events }: { events: RBCEvent[] }) {
  useEffect(() => {
    const timers: number[] = [];
    for (const e of events) {
      const start = (e as any).start as Date;
      const msUntil = start.getTime() - Date.now() - 5 * 60 * 1000; // 5 minutes before
      if (msUntil > 0) {
        const id = window.setTimeout(() => {
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Upcoming event", {
              body: String(e.title),
            });
          }
        }, msUntil);
        timers.push(id);
      }
    }
    return () => {
      timers.forEach((id) => clearTimeout(id));
    };
  }, [events]);
  return null;
}
