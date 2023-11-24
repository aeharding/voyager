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
import useCanModerate, {
  ModeratorRole,
  getModColor,
  getModIcon,
} from "../../moderation/useCanModerate";
import { CommunityView, ListingType } from "lemmy-js-client";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";

type ModActionsProps =
  | {
      community: CommunityView | undefined;
      communityHandle: string;
    }
  | { type: "Local" | "ModeratorView" };

export default function ModActions(props: ModActionsProps) {
  const canModerate = useCanModerate(
    "communityHandle" in props ? props.community?.community : undefined,
  );

  if (!canModerate && "communityHandle" in props) return;

  const role =
    "type" in props
      ? (() => {
          switch (props.type) {
            case "Local":
              return "admin-local";
            case "ModeratorView":
              return "mod";
          }
        })()
      : canModerate!;

  return <Actions {...props} role={role} />;
}

type ActionsProps = ModActionsProps & {
  role: ModeratorRole;
};

function Actions(props: ActionsProps) {
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
      cssClass: `${props.role} left-align-buttons`,
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
      <IonIcon icon={getModIcon(props.role)} color={getModColor(props.role)} />
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
