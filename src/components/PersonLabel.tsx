import { css } from "@emotion/react";
import { PersonSafe } from "lemmy-js-client";

interface PersonLabelProps {
  person: PersonSafe;
  op?: PersonSafe;
  distinguished?: boolean;

  className?: string;
}

export default function PersonLabel({
  person,
  op,
  distinguished,
  className,
}: PersonLabelProps) {
  let color: string | undefined;

  if (distinguished) {
    if (person.admin) color = "#ff0000";
    else color = "#00e600";
  } else if (op && person.id === op.id) color = "#00a2ff";

  return (
    <span
      className={className}
      css={
        color &&
        css`
          color: ${color};
        `
      }
    >
      {person.name}
    </span>
  );
}
