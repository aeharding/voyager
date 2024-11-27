import { useIonActionSheet } from "@ionic/react";
import { compact } from "es-toolkit";
import {
  chatbubbleOutline,
  fileTrayFullOutline,
  footstepsOutline,
} from "ionicons/icons";
import { CommunityView } from "lemmy-js-client";

import { getFeedUrlName } from "#/features/community/mod/ModActions";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";

import useCanModerate from "./useCanModerate";

export interface CommunityUseModZoneActionsProps {
  community: CommunityView | undefined;
  communityHandle: string;
}

export interface SpecialFeedUseModZoneActionsProps {
  type: "ModeratorView";
}

export type UseModZoneActionsProps =
  | CommunityUseModZoneActionsProps
  | SpecialFeedUseModZoneActionsProps;

export default function useModZoneActions(props: UseModZoneActionsProps) {
  const [presentActionSheet] = useIonActionSheet();
  const router = useOptimizedIonRouter();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const role = useCanModerate(
    "communityHandle" in props ? props.community?.community : true,
  );

  function present() {
    presentActionSheet({
      cssClass: `${role} left-align-buttons`,
      buttons: compact([
        {
          text: "Mod Queue",
          icon: fileTrayFullOutline,
          handler: () => {
            router.push(
              buildGeneralBrowseLink(
                "communityHandle" in props
                  ? `/c/${props.communityHandle}/modqueue`
                  : `/${getFeedUrlName(props.type)}/modqueue`,
              ),
            );
          },
        },
        {
          text: "Mod Log",
          icon: footstepsOutline,
          handler: () => {
            router.push(
              buildGeneralBrowseLink(
                "communityHandle" in props
                  ? `/c/${props.communityHandle}/log`
                  : `/${getFeedUrlName(props.type)}/log`,
              ),
            );
          },
        },
        {
          text: "All Comments",
          icon: chatbubbleOutline,
          handler: () => {
            router.push(
              buildGeneralBrowseLink(
                "communityHandle" in props
                  ? `/c/${props.communityHandle}/comments`
                  : `/${getFeedUrlName(props.type)}/comments`,
              ),
            );
          },
        },
        // "communityHandle" in props
        //   ? {
        //       text: "Moderators",
        //       icon: shieldCheckmarkOutline,
        //       handler: () => {
        //         (async () => {
        //           // await dispatch(modRemoveComment(comment, false));
        //           // presentToast(commentApproved);
        //         })();
        //       },
        //     }
        //   : undefined,
        {
          text: "Cancel",
          role: "cancel",
        },
      ]),
    });
  }

  return { present, role };
}
