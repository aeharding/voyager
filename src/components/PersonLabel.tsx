import { css } from "@emotion/react";
import { Link } from "react-router-dom";
import { getHandle, getItemActorName } from "../helpers/lemmy";
import styled from "@emotion/styled";
import { useBuildGeneralBrowseLink } from "../helpers/routes";
import { Person } from "lemmy-js-client";

const StyledLink = styled(Link)`
  text-decoration: none;
`;

interface PersonLabelProps {
  person: Person;
  opId?: number;
  distinguished?: boolean;
  showAtInstanceWhenRemote?: boolean;

  className?: string;
}

export default function PersonLabel({
  person,
  opId,
  distinguished,
  className,
  showAtInstanceWhenRemote,
}: PersonLabelProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  let color: string | undefined;

  if (distinguished) {
    if (person.admin) color = "#ff0000";
    else color = "#00e600";
  } else if (opId && person.id === opId) color = "var(--ion-color-primary)";

  return (
    <StyledLink
      to={buildGeneralBrowseLink(`/u/${getHandle(person)}`)}
      onClick={(e) => e.stopPropagation()}
      className={className}
      css={
        color
          ? css`
              && {
                color: ${color};
              }
            `
          : css`
              color: inherit;
            `
      }
    >
      {showAtInstanceWhenRemote ? (
        <>
          {person.name}
          {!person.local && <aside>@{getItemActorName(person)}</aside>}
        </>
      ) : (
        person.name
      )}
    </StyledLink>
  );
}
