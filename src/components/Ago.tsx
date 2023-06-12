import React from "react";
import { formatDistanceToNowStrict } from "date-fns";

interface AgoProps {
  date: Date;
}

const Ago: React.FC<AgoProps> = ({ date }) => {
  const relativeDate = formatDistanceToNowStrict(date, { addSuffix: false });

  const getRelativeDateString = (relativeDate: string) => {
    const [value, unit] = relativeDate.split(" ");
    let formattedString = "";

    if (unit === "seconds") {
      formattedString = value === "less" ? "<1m" : `${value}s`;
    } else {
      switch (unit) {
        case "minutes":
          formattedString = `${value}m`;
          break;
        case "hours":
          formattedString = `${value}h`;
          break;
        case "days":
          formattedString = `${value}d`;
          break;
        case "months":
          formattedString = `${value}m`;
          break;
        case "years":
          formattedString = `${value}y`;
          break;
        default:
          formattedString = relativeDate;
      }
    }

    return formattedString;
  };

  return <span>{getRelativeDateString(relativeDate)}</span>;
};

export default Ago;
