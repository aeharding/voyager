import { css } from "@emotion/react";
import { Person } from "lemmy-js-client";

interface PersonLabelProps {
  person: Person;
  op?: Person;
  distinguished?: boolean;
}

export default function PersonLabel({
  person,
  op,
  distinguished,
}: PersonLabelProps) {
  let color: string | undefined;

  if (distinguished) {
    if (person.admin) color = "#ff0000";
    else color = "#00e600";
  } else if (op && person.id === op.id) color = "#00a2ff";

  return (
    <span
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
