import { cx } from "@linaria/core";
import { styled } from "@linaria/react";
import { Person } from "lemmy-js-client";
import { useCallback, useContext } from "react";
import { LongPressOptions, useLongPress } from "use-long-press";

import { ShareImageContext } from "#/features/share/asImage/ShareAsImage";
import UserScore from "#/features/tags/UserScore";
import UserTag from "#/features/tags/UserTag";
import usePresentUserActions, {
  PresentUserActionsOptions,
} from "#/features/user/usePresentUserActions";
import {
  preventOnClickNavigationBug,
  stopIonicTapClick,
} from "#/helpers/ionic";
import { getHandle, getRemoteHandle } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { OInstanceUrlDisplayMode } from "#/services/db";
import { useAppSelector } from "#/store";

import { renderHandle } from "../Handle";
import AgeBadge from "./AgeBadge";
import { hideCss, LinkContainer, StyledLink } from "./shared";

const Prefix = styled.span`
  font-weight: normal;
`;

interface PersonLinkProps extends Pick<PresentUserActionsOptions, "sourceUrl"> {
  person: Person;
  opId?: number;
  distinguished?: boolean;
  showInstanceWhenRemote?: boolean;
  prefix?: string;
  showBadge?: boolean;
  disableInstanceClick?: boolean;
  showTag?: boolean;

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
  showTag = true,
  disableInstanceClick,
  sourceUrl,
}: PersonLinkProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const isAdmin = useAppSelector((state) => state.site.response?.admins)?.some(
    (admin) => admin.person.actor_id === person.actor_id,
  );
  const { hideUsernames } = useContext(ShareImageContext);
  const presentUserActions = usePresentUserActions();

  const tag = useAppSelector(
    (state) => state.userTag.tagByRemoteHandle[getRemoteHandle(person)],
  );
  const tagsEnabled = useAppSelector((state) => state.settings.tags.enabled);
  const trackVotesEnabled = useAppSelector(
    (state) => state.settings.tags.trackVotes,
  );
  const hideInstance = useAppSelector(
    (state) => state.settings.tags.enabled && state.settings.tags.hideInstance,
  );

  const onCommunityLinkLongPress = useCallback(() => {
    stopIonicTapClick();

    presentUserActions(person, { sourceUrl });
  }, [presentUserActions, person, sourceUrl]);

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

  const tagText = typeof tag === "object" ? tag.text : undefined;

  const shouldHideInstanceWithTagText = tagText && hideInstance;
  const shouldShowInstanceByDefault =
    showInstanceWhenRemote || forceInstanceUrl;

  const [handle, instance] = renderHandle({
    showInstanceWhenRemote: shouldHideInstanceWithTagText
      ? false
      : shouldShowInstanceByDefault,
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
      {showTag && tagsEnabled && (
        <>
          {trackVotesEnabled && <UserScore person={person} prefix=" " />}
          <UserTag person={person} prefix=" " />
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
