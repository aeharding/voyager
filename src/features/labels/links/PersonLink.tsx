import { Person } from "lemmy-js-client";
import { use, useCallback } from "react";
import { Link } from "react-router-dom";
import { LongPressOptions, useLongPress } from "use-long-press";

import { ShareImageContext } from "#/features/share/asImage/ShareAsImage";
import UserScore from "#/features/tags/UserScore";
import UserTag from "#/features/tags/UserTag";
import usePresentUserActions, {
  PresentUserActionsOptions,
} from "#/features/user/usePresentUserActions";
import { cx } from "#/helpers/css";
import {
  preventOnClickNavigationBug,
  stopIonicTapClick,
} from "#/helpers/ionic";
import { getHandle, getRemoteHandle } from "#/helpers/lemmy";
import { getApId } from "#/helpers/lemmyCompat";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { OInstanceUrlDisplayMode } from "#/services/db";
import { useAppSelector } from "#/store";

import { renderHandle } from "../Handle";
import AgeBadge from "./AgeBadge";

import styles from "./PersonLink.module.css";
import sharedStyles from "./shared.module.css";

interface PersonLinkProps extends Pick<PresentUserActionsOptions, "sourceUrl"> {
  person: Person;
  color?: string;
  opId?: number;
  distinguished?: boolean;
  showInstanceWhenRemote?: boolean;
  prefix?: React.ReactNode;
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
  color: _color,
  showInstanceWhenRemote,
  prefix,
  showBadge = true,
  showTag = true,
  disableInstanceClick,
  sourceUrl,
}: PersonLinkProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const isAdmin = useAppSelector((state) => state.site.response?.admins)?.some(
    (admin) => getApId(admin.person) === getApId(person),
  );
  const { hideUsernames } = use(ShareImageContext);
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

  const accommodateLargeText = useAppSelector(
    (state) => state.settings.appearance.font.accommodateLargeText,
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

  if (_color) color = _color;
  else if (isAdmin) color = "var(--ion-color-danger)";
  else if (distinguished) color = "var(--ion-color-success)";
  else if (
    getApId(person) === "https://lemmy.world/u/aeharding" ||
    getApId(person) === "https://vger.social/u/aeharding"
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

  const suffix = (
    <>
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

  if (accommodateLargeText) {
    return (
      <div className={sharedStyles.linkContainerParentLarge}>
        <div className={sharedStyles.linkContainerChildLarge}>
          <Link
            className={sharedStyles.link}
            to={buildGeneralBrowseLink(`/u/${getHandle(person)}`)}
            onClick={(e) => {
              e.stopPropagation();
              preventOnClickNavigationBug(e);
            }}
            draggable={false}
          >
            {prefix ? (
              <>
                <span className={styles.prefix}>{prefix}</span>{" "}
              </>
            ) : undefined}

            {!disableInstanceClick ? (
              <>
                <span className={styles.shrinkable}>
                  {handle}
                  {instance}
                </span>
                {suffix}
              </>
            ) : (
              handle
            )}
          </Link>

          {disableInstanceClick && (
            <span className={styles.shrinkable}>
              {instance}
              {suffix}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <span
      {...bind()}
      className={cx(
        sharedStyles.linkContainer,
        className,
        hideUsernames ? sharedStyles.hide : undefined,
      )}
      style={{ color }}
    >
      <Link
        className={sharedStyles.link}
        to={buildGeneralBrowseLink(`/u/${getHandle(person)}`)}
        onClick={(e) => {
          e.stopPropagation();
          preventOnClickNavigationBug(e);
        }}
        draggable={false}
      >
        {prefix ? (
          <>
            <span className={styles.prefix}>{prefix}</span>{" "}
          </>
        ) : undefined}
        {!disableInstanceClick ? (
          <>
            <span className={styles.shrinkable}>
              {handle}
              {instance}
            </span>
            {suffix}
          </>
        ) : (
          handle
        )}
      </Link>
      {disableInstanceClick && (
        <span className={styles.shrinkable}>
          {instance}
          {suffix}
        </span>
      )}
    </span>
  );
}

const onStart: LongPressOptions["onStart"] = (e) => {
  e.stopPropagation();
};
