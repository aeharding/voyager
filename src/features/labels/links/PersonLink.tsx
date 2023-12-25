import { css } from "@emotion/react";
import { getHandle } from "../../../helpers/lemmy";
import styled from "@emotion/styled";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { Person } from "lemmy-js-client";
import Handle from "../Handle";
import { StyledLink, hideCss } from "./shared";
import { useAppSelector } from "../../../store";
import {
  OInstanceUrlDisplayMode,
  OUserAvatarDisplayMode,
} from "../../../services/db";
import AgeBadge from "./AgeBadge";
import { useContext } from "react";
import { ShareImageContext } from "../../share/asImage/ShareAsImage";
import ItemIcon from "../img/ItemIcon";

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
      ${hideCss}
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
  const isAdmin = useAppSelector((state) => state.site.response?.admins)?.some(
    (admin) => admin.person.actor_id === person.actor_id,
  );
  const { hideUsernames } = useContext(ShareImageContext);

  let color: string | undefined;

  const forceInstanceUrl =
    useAppSelector(
      (state) => state.settings.appearance.general.userInstanceUrlDisplay,
    ) === OInstanceUrlDisplayMode.WhenRemote;

  const userAvatarDisplay =
    useAppSelector(
      (state) => state.settings.appearance.general.userAvatarDisplay,
    ) === OUserAvatarDisplayMode.InComments;

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
      ) : (
        userAvatarDisplay && (
          <ItemIcon
            item={person}
            size={24}
            css={css`
              margin-right: 0.4rem;
              vertical-align: middle;
            `}
          />
        )
      )}
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
