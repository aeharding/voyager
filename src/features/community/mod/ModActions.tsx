import {
  IonButton,
  IonIcon,
  useIonActionSheet,
  useIonRouter,
} from "@ionic/react";
import {
  chatbubbleOutline,
  footstepsOutline,
  shieldCheckmarkOutline,
} from "ionicons/icons";
import { MouseEvent } from "react";
import { notEmpty } from "../../../helpers/array";
import useCanModerate from "../../moderation/useCanModerate";
import { CommunityView, ListingType } from "lemmy-js-client";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";

type ModActionsProps =
  | {
      community: CommunityView | undefined;
      communityHandle: string;
    }
  | { type: ListingType };

export default function ModActions(props: ModActionsProps) {
  const isMod = useCanModerate(
    "communityHandle" in props ? props.community?.community.id : undefined,
  );

  if (!isMod && "communityHandle" in props) return;

  return <Actions {...props} />;
}

function Actions(props: ModActionsProps) {
  // const [presentAlert] = useIonAlert();
  // const dispatch = useAppDispatch();
  // const [loading, setLoading] = useState(false);
  const [presentActionSheet] = useIonActionSheet();
  // const presentToast = useAppToast();
  const router = useIonRouter();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  function onClick(e: MouseEvent) {
    e.stopPropagation();

    presentActionSheet({
      cssClass: "left-align-buttons mod",
      buttons: [
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

  return (
    <IonButton onClick={onClick}>
      <IonIcon icon={shieldCheckmarkOutline} color="success" />
    </IonButton>
  );
}

export function getFeedUrlName(type: ListingType): string {
  switch (type) {
    case "All":
      return "all";
    case "Local":
      return "local";
    case "ModeratorView":
      return "mod";
    case "Subscribed":
      return "home";
  }
}
