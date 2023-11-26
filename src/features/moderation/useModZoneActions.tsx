import { useIonActionSheet, useIonRouter } from "@ionic/react";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import {
  chatbubbleOutline,
  fileTrayFullOutline,
  footstepsOutline,
} from "ionicons/icons";
import { CommunityView } from "lemmy-js-client";
import useCanModerate from "./useCanModerate";
import { getFeedUrlName } from "../community/mod/ModActions";
import { notEmpty } from "../../helpers/array";

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
  const router = useIonRouter();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const role = useCanModerate(
    "communityHandle" in props ? props.community?.community : true,
  );

  function present() {
    presentActionSheet({
      cssClass: `${role} left-align-buttons`,
      buttons: [
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
        //           // await dispatch(modRemoveComment(comment.id, false));
        //           // presentToast(commentApproved);
        //         })();
        //       },
        //     }
        //   : undefined,
        {
          text: "Cancel",
          role: "cancel",
        },
      ].filter(notEmpty),
    });
  }

  return { present, role };
}
