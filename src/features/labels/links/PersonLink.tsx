import { getHandle } from "../../../helpers/lemmy";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { Person } from "lemmy-js-client";
import { renderHandle } from "../Handle";
import { useAppSelector } from "../../../store";
import { OInstanceUrlDisplayMode } from "../../../services/db";
import AgeBadge from "./AgeBadge";
import { useCallback, useContext } from "react";
import { ShareImageContext } from "../../share/asImage/ShareAsImage";
import {
  preventOnClickNavigationBug,
  stopIonicTapClick,
} from "../../../helpers/ionic";
import { styled } from "@linaria/react";
import { LinkContainer, StyledLink, hideCss } from "./shared";
import { cx } from "@linaria/core";
import { LongPressOptions, useLongPress } from "use-long-press";
import usePresentUserActions from "../../user/usePresentUserActions";

const Prefix = styled.span`
  font-weight: normal;
`;

interface PersonLinkProps {
  person: Person;
  opId?: number;
  distinguished?: boolean;
  showInstanceWhenRemote?: boolean;
  prefix?: string;
  showBadge?: boolean;
  disableInstanceClick?: boolean;

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
  disableInstanceClick,
}: PersonLinkProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const isAdmin = useAppSelector((state) => state.site.response?.admins)?.some(
    (admin) => admin.person.actor_id === person.actor_id,
  );
  const { hideUsernames } = useContext(ShareImageContext);
  const presentUserActions = usePresentUserActions();

  const onCommunityLinkLongPress = useCallback(() => {
    stopIonicTapClick();

    presentUserActions(getHandle(person));
  }, [presentUserActions, person]);

  const bind = useLongPress(onCommunityLinkLongPress, {
    cancelOnMovement: 15,
    onStart,
  });

  const forceInstanceUrl =
    useAppSelector(
      (state) => state.settings.appearance.general.userInstanceUrlDisplay,
    ) === OInstanceUrlDisplayMode.WhenRemote;

  let color: string | undefined;

  if (isAdmin) color = "var(--ion-color-danger)";
  else if (distinguished) color = "var(--ion-color-success)";
  else if (
    person.actor_id === "https://lemmy.world/u/aeharding" ||
    person.actor_id === "https://vger.social/u/aeharding"
  )
    color = "var(--ion-color-tertiary-tint)";
  else if (opId && person.id === opId) color = "var(--ion-color-primary-fixed)";

  const [handle, instance] = renderHandle({
    showInstanceWhenRemote: showInstanceWhenRemote || forceInstanceUrl,
    item: person,
  });

  const end = (
    <>
      {instance}
      {showBadge && (
        <>
          {person.bot_account && " 🤖"}
          <AgeBadge published={person.published} />
        </>
      )}
    </>
  );

  return (
    <LinkContainer
      {...bind()}
      className={cx(className, hideUsernames ? hideCss : undefined)}
      style={{ color }}
    >
      <StyledLink
        to={buildGeneralBrowseLink(`/u/${getHandle(person)}`)}
        onClick={(e) => {
          e.stopPropagation();
          preventOnClickNavigationBug(e);
        }}
        draggable={false}
      >
        {prefix ? (
          <>
            <Prefix>{prefix}</Prefix>{" "}
          </>
        ) : undefined}
        {handle}
        {!disableInstanceClick && end}
      </StyledLink>
      {disableInstanceClick && end}
    </LinkContainer>
  );
}

const onStart: LongPressOptions["onStart"] = (e) => {
  e.stopPropagation();
};
