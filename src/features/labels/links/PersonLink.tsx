import { getHandle } from "../../../helpers/lemmy";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { Person } from "lemmy-js-client";
import { renderHandle } from "../Handle";
import store, { useAppDispatch, useAppSelector } from "../../../store";
import { OInstanceUrlDisplayMode } from "../../../services/db";
import AgeBadge from "./AgeBadge";
import { useCallback, useContext } from "react";
import { ShareImageContext } from "../../share/asImage/ShareAsImage";
import { preventOnClickNavigationBug } from "../../../helpers/ionic";
import { styled } from "@linaria/react";
import { LinkContainer, StyledLink, hideCss } from "./shared";
import { cx } from "@linaria/core";
import { LongPressOptions, useLongPress } from "use-long-press";
import { useIonActionSheet } from "@ionic/react";
import { removeCircleOutline } from "ionicons/icons";
import { blockUser } from "../../user/userSlice";
import useAppToast from "../../../helpers/useAppToast";
import { buildBlocked } from "../../../helpers/toastMessages";
import { getBlockUserErrorMessage } from "../../../helpers/lemmyErrors";

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
  const presentToast = useAppToast();
  const [presentActionSheet] = useIonActionSheet();
  const dispatch = useAppDispatch();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const isAdmin = useAppSelector((state) => state.site.response?.admins)?.some(
    (admin) => admin.person.actor_id === person.actor_id,
  );
  const { hideUsernames } = useContext(ShareImageContext);

  const onCommunityLinkLongPress = useCallback(() => {
    const state = store.getState();

    const blocks = state.site.response?.my_user?.person_blocks;
    const isBlocked = blocks?.some(
      (b) => getHandle(b.target) === getHandle(person),
    );

    presentActionSheet({
      cssClass: "left-align-buttons",
      buttons: [
        {
          text: `${isBlocked ? "Unblock" : "Block"} User`,
          icon: removeCircleOutline,
          role: "destructive",
          handler: () => {
            (async () => {
              try {
                await dispatch(blockUser(!isBlocked, person.id));
              } catch (error) {
                presentToast({
                  color: "danger",
                  message: getBlockUserErrorMessage(error, person),
                });
                throw error;
              }

              presentToast(buildBlocked(!isBlocked, getHandle(person)));
            })();
          },
        },
        {
          text: "Cancel",
          role: "cancel",
        },
      ],
    });
  }, [presentActionSheet, presentToast, dispatch, person]);

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
    person.actor_id === "https://midwest.social/u/aeharding"
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
