import { differenceInDays, differenceInHours, format } from "date-fns";

interface TimeProps {
  date: string;
}

export default function Time({ date: dateStr }: TimeProps) {
  const date = new Date(dateStr);

  if (differenceInDays(new Date(), date) > 6) {
    return <>{format(date, "PP")}</>;
  }

  if (differenceInHours(new Date(), date) > 24) {
    return <>{format(date, "iiii")}</>;
  }

  return <>{format(date, "p")}</>;
}
