import { IonIcon, useIonAlert } from "@ionic/react";
import { useAppDispatch } from "../../../store";
import useAppToast from "../../../helpers/useAppToast";
import { modRemoveComment } from "../../comment/commentSlice";
import { modRemovePost } from "../../post/postSlice";
import { CommentView, PostView } from "lemmy-js-client";
import { commentApproved, postApproved } from "../../../helpers/toastMessages";
import { Banner, ItemModState } from "./ModeratableItemBanner";
import { trashOutline } from "ionicons/icons";
import { isPost } from "../../../helpers/lemmy";

interface RemovedBannerProps {
  itemView: CommentView | PostView;
}

export default function RemovedBanner({ itemView }: RemovedBannerProps) {
  const [present] = useIonAlert();
  const dispatch = useAppDispatch();
  const presentToast = useAppToast();

  function onClickModRemovedPopup() {
    present("Removed by mod", [
      {
        text: "Approve",
        handler: () => {
          (async () => {
            if (isPost(itemView)) {
              dispatch(modRemovePost(itemView.post.id, false));
              presentToast(postApproved);
            } else {
              await dispatch(modRemoveComment(itemView.comment.id, false));
              presentToast(commentApproved);
            }
          })();
        },
      },
      { text: "OK", role: "cancel" },
    ]);
  }

  return (
    <Banner
      modState={ItemModState.RemovedByMod}
      onClick={(e) => {
        e.stopPropagation();
        onClickModRemovedPopup();
      }}
    >
      <IonIcon icon={trashOutline} /> Removed
    </Banner>
  );
}
