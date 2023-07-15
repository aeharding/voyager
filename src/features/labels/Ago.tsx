import { formatDistanceToNowStrict } from "date-fns";

interface AgoProps {
  date: string;
  className?: string;
}

export default function Ago({ date, className }: AgoProps) {
  return <span className={className}>{formatRelative(date)}</span>;
}

export function formatRelative(date: string): string {
  const relativeDate = formatDistanceToNowStrict(new Date(`${date}Z`), {
    addSuffix: false,
  });

  return getRelativeDateString(relativeDate);
}

const getRelativeDateString = (relativeDate: string) => {
  const [value, unit] = relativeDate.split(" ");

  switch (unit) {
    case "seconds":
    case "second":
      return "<1m";
    case "minutes":
    case "minute":
      return `${value}m`;
    case "hours":
    case "hour":
      return `${value}h`;
    case "days":
    case "day":
      return `${value}d`;
    case "months":
    case "month":
      return `${value}mo`;
    case "years":
    case "year":
      return `${value}y`;
    default:
      return relativeDate;
  }
};
