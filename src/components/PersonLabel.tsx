import { css } from "@emotion/react";
import { Person } from "lemmy-js-client";

interface PersonLabelProps {
  person: Person;
  op?: Person;
}

export default function PersonLabel({ person, op }: PersonLabelProps) {
  let color: string | undefined;

  if (op && person.id === op.id) color = "#00a2ff";
  if (person.admin) color = "#ff0000";

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
