import { css } from "@emotion/react";
import { getHandle } from "../../../helpers/lemmy";
import styled from "@emotion/styled";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { Person } from "lemmy-js-client";
import Handle from "../Handle";
import { StyledLink } from "./shared";
import { useAppSelector } from "../../../store";
import { OInstanceUrlDisplayMode } from "../../../services/db";
import AgeBadge from "./AgeBadge";
import { useContext } from "react";
import { ShareImageContext } from "../../share/asImage/ShareAsImage";

const Prefix = styled.span`
  font-weight: normal;
`;

const PersonLinkEl = styled(StyledLink, {
  shouldForwardProp: (prop) => prop !== "hideUsername",
})<{
  color: string | undefined;
  hideUsername: boolean;
}>`
  ${({ color }) =>
    color
      ? css`
          && {
            color: ${color};
          }
        `
      : undefined}

  ${({ hideUsername }) =>
    hideUsername &&
    css`
      position: relative;

      &:after {
        content: "";
        position: absolute;
        inset: 0;
        background: var(--ion-color-step-150, #ccc);
      }
    `}
`;

interface PersonLinkProps {
  person: Person;
  opId?: number;
  distinguished?: boolean;
  showInstanceWhenRemote?: boolean;
  prefix?: string;
  showBadge?: boolean;

  className?: string;
}

export default function PersonLink({
  person,
  opId,
  distinguished,
  className,
  showInstanceWhenRemote,
  prefix,
  showBadge = true,
}: PersonLinkProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const isAdmin = useAppSelector((state) => state.auth.site?.admins)?.some(
    (admin) => admin.person.actor_id === person.actor_id,
  );
  const { hideUsernames } = useContext(ShareImageContext);

  let color: string | undefined;

  const forceInstanceUrl =
    useAppSelector(
      (state) => state.settings.appearance.general.userInstanceUrlDisplay,
    ) === OInstanceUrlDisplayMode.WhenRemote;

  if (isAdmin) color = "var(--ion-color-danger)";
  else if (distinguished) color = "var(--ion-color-success)";
  else if (opId && person.id === opId) color = "var(--ion-color-primary-fixed)";

  return (
    <PersonLinkEl
      to={buildGeneralBrowseLink(`/u/${getHandle(person)}`)}
      onClick={(e) => e.stopPropagation()}
      className={className}
      hideUsername={hideUsernames}
      color={color}
    >
      {prefix ? (
        <>
          <Prefix>{prefix}</Prefix>{" "}
        </>
      ) : undefined}
      <Handle
        item={person}
        showInstanceWhenRemote={showInstanceWhenRemote || forceInstanceUrl}
      />
      {showBadge && (
        <>
          {person.bot_account && " 🤖"}
          <AgeBadge published={person.published} />
        </>
      )}
    </PersonLinkEl>
  );
}
