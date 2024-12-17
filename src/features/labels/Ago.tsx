import { Duration, formatDuration, intervalToDuration } from "date-fns";
import { round } from "es-toolkit";

import { formatDistanceShort } from "./formatDistanceShort";

interface AgoProps {
  date: string;
  as?: "ultrashort" | "short" | "verbose";
  shorthand?: boolean;
  className?: string;
}

export default function Ago({ date, className, as = "ultrashort" }: AgoProps) {
  return (
    <span className={className}>{formatRelative(new Date(date), as)}</span>
  );
}

export function formatRelative(
  date: Date,
  as: AgoProps["as"] = "ultrashort",
): string {
  const now = new Date();
  const duration = intervalToDuration({ start: date, end: now });

  let distance: string;

  switch (as) {
    case "verbose": {
      distance = formatDuration(duration, {
        delimiter: ", ",
        format: ["years", "months", "days"],
      });
      break;
    }
    case "short": {
      distance = formatDuration(duration, {
        delimiter: " ",
        format: getFormatShort(duration),
        locale: {
          formatDistance: formatDistanceShort,
        },
      });
      break;
    }
    case "ultrashort": {
      if (duration.months && duration.years) {
        duration.years += round(duration.months / 12, 1);
        delete duration.months;
      }
      distance = formatDuration(duration, {
        delimiter: " ",
        format: getFormatUltrashort(duration),
        locale: {
          formatDistance: formatDistanceShort,
        },
      });
    }
  }

  if (!distance) {
    if (as === "verbose") return "now";
    return "<1s";
  }

  return distance;
}

function getFormatShort(duration: Duration): (keyof Duration)[] {
  if (duration.years) return ["years", "months"];
  if (duration.months) return ["months"];
  if (duration.days) return ["days"];
  if (duration.hours) return ["hours"];
  if (duration.minutes) return ["minutes"];
  if (duration.seconds) return ["seconds"];
  return ["seconds"];
}

function getFormatUltrashort(duration: Duration): (keyof Duration)[] {
  if (duration.years) return ["years"];

  return getFormatShort(duration);
}
