import { DateTime } from "luxon";
import { RRule, RRuleSet, rrulestr } from "rrule";

export type EventLike = {
  id: string;
  title: string;
  startUtc: Date;
  endUtc: Date;
  allDay: boolean;
  rrule?: string | null;
  exdatesJson?: string | null;
  rdatesJson?: string | null;
  timezone?: string | null;
};

export type Occurrence = {
  eventId: string;
  title: string;
  startUtc: Date;
  endUtc: Date;
  allDay: boolean;
};

function parseJsonArray(input?: string | null): string[] {
  if (!input) return [];
  try {
    const arr = JSON.parse(input);
    if (Array.isArray(arr)) return arr as string[];
    return [];
  } catch {
    return [];
  }
}

export function expandEventOccurrences(
  event: EventLike,
  windowStartUtc: Date,
  windowEndUtc: Date
): Occurrence[] {
  const occurrences: Occurrence[] = [];

  const baseStart = DateTime.fromJSDate(event.startUtc, { zone: "utc" });
  const baseEnd = DateTime.fromJSDate(event.endUtc, { zone: "utc" });

  if (!event.rrule) {
    if (
      baseEnd.toJSDate() >= windowStartUtc &&
      baseStart.toJSDate() <= windowEndUtc
    ) {
      occurrences.push({
        eventId: event.id,
        title: event.title,
        startUtc: event.startUtc,
        endUtc: event.endUtc,
        allDay: !!event.allDay,
      });
    }
    return occurrences;
  }

  const set = new RRuleSet();
  try {
    const rule = rrulestr(event.rrule, { dtstart: baseStart.toJSDate() });
    set.rrule(rule as RRule);
  } catch {
    // Invalid RRULE; treat as non-recurring
    if (
      baseEnd.toJSDate() >= windowStartUtc &&
      baseStart.toJSDate() <= windowEndUtc
    ) {
      occurrences.push({
        eventId: event.id,
        title: event.title,
        startUtc: event.startUtc,
        endUtc: event.endUtc,
        allDay: !!event.allDay,
      });
    }
    return occurrences;
  }

  parseJsonArray(event.exdatesJson).forEach((iso) => {
    const dt = DateTime.fromISO(iso, { zone: "utc" });
    if (dt.isValid) set.exdate(dt.toJSDate());
  });
  parseJsonArray(event.rdatesJson).forEach((iso) => {
    const dt = DateTime.fromISO(iso, { zone: "utc" });
    if (dt.isValid) set.rdate(dt.toJSDate());
  });

  const between = set.between(windowStartUtc, windowEndUtc, true);
  for (const start of between) {
    const durationMs = baseEnd.toMillis() - baseStart.toMillis();
    const startDt = DateTime.fromJSDate(start, { zone: "utc" });
    const endDt = startDt.plus({ milliseconds: durationMs });
    occurrences.push({
      eventId: event.id,
      title: event.title,
      startUtc: startDt.toJSDate(),
      endUtc: endDt.toJSDate(),
      allDay: !!event.allDay,
    });
  }

  return occurrences;
}
