import { css } from "@emotion/react";
import { PersonSafe } from "lemmy-js-client";
import { Link, useParams } from "react-router-dom";
import { getHandle, getItemActorName } from "../helpers/lemmy";
import styled from "@emotion/styled";
import { useBuildGeneralBrowseLink } from "../helpers/routes";

const StyledLink = styled(Link)`
  text-decoration: none;
`;

interface PersonLabelProps {
  person: PersonSafe;
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
  } else if (opId && person.id === opId) color = "#00a2ff";

  return (
    <StyledLink
      to={buildGeneralBrowseLink(`/u/${getHandle(person)}`)}
      onClick={(e) => e.stopPropagation()}
      className={className}
      css={
        color
          ? css`
              color: ${color};
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
