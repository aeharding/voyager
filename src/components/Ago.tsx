import React from "react";
import { formatDistanceToNowStrict } from "date-fns";

interface AgoProps {
  date: Date;
  className?: string;
}

const Ago: React.FC<AgoProps> = ({ date, className }) => {
  const relativeDate = formatDistanceToNowStrict(date, { addSuffix: false });

  const getRelativeDateString = (relativeDate: string) => {
    const [value, unit] = relativeDate.split(" ");
    let formattedString = "";

    if (unit === "seconds") {
      formattedString = value === "less" ? "<1m" : `${value}s`;
    } else {
      switch (unit) {
        case "minutes":
        case "minute":
          formattedString = `${value}m`;
          break;
        case "hours":
        case "hour":
          formattedString = `${value}h`;
          break;
        case "days":
        case "day":
          formattedString = `${value}d`;
          break;
        case "months":
        case "month":
          formattedString = `${value}m`;
          break;
        case "years":
        case "year":
          formattedString = `${value}y`;
          break;
        default:
          formattedString = relativeDate;
      }
    }

    return formattedString;
  };

  return (
    <span className={className}>{getRelativeDateString(relativeDate)}</span>
  );
};

export default Ago;
