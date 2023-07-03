import { css } from "@emotion/react";
import { getHandle } from "../../../helpers/lemmy";
import styled from "@emotion/styled";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { Person } from "lemmy-js-client";
import Handle from "../Handle";
import { StyledLink } from "./shared";
import { personSelector } from "../../auth/authSlice";
import { useAppSelector } from "../../../store";
import { OInstanceUrlDisplayMode } from "../../../services/db";

const Prefix = styled.span`
  font-weight: normal;
`;

interface PersonLinkProps {
  person: Person;
  opId?: number;
  distinguished?: boolean;
  showInstanceWhenRemote?: boolean;
  prefix?: string;

  className?: string;

  noUserHighlight?: boolean;
}

export default function PersonLink({
  person,
  opId,
  distinguished,
  className,
  showInstanceWhenRemote,
  prefix,
  noUserHighlight,
}: PersonLinkProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  let color: string | undefined;

  const forceInstanceUrl =
    useAppSelector(
      (state) => state.settings.appearance.general.userInstanceUrlDisplay
    ) === OInstanceUrlDisplayMode.WhenRemote;

  const user = useAppSelector(personSelector);
  const same_user =
    user && user.instance_id === person.instance_id && user.id === person.id;

  if (!noUserHighlight && same_user) color = "var(--ion-color-warning-shade)";
  else if (!noUserHighlight && person.admin) color = "var(--ion-color-danger)";
  else if (distinguished) color = "var(--ion-color-success)";
  else if (opId && person.id === opId) color = "var(--ion-color-primary)";

  return (
    <StyledLink
      to={buildGeneralBrowseLink(`/u/${getHandle(person)}`)}
      onClick={(e) => e.stopPropagation()}
      className={className}
    >
      {prefix ? (
        <>
          <Prefix>{prefix}</Prefix>{" "}
        </>
      ) : undefined}
      <span
        css={
          color
            ? css`
                && {
                  color: ${color};
                }
              `
            : undefined
        }
      >
        <Handle
          item={person}
          showInstanceWhenRemote={showInstanceWhenRemote || forceInstanceUrl}
        />
      </span>
    </StyledLink>
  );
}
