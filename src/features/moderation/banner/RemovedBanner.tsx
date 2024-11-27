import { IonIcon, useIonAlert } from "@ionic/react";
import { trashOutline } from "ionicons/icons";
import { CommentView, PostView } from "lemmy-js-client";

import { modRemoveComment } from "#/features/comment/commentSlice";
import { modRemovePost } from "#/features/post/postSlice";
import { isPost } from "#/helpers/lemmy";
import { commentApproved, postApproved } from "#/helpers/toastMessages";
import useAppToast from "#/helpers/useAppToast";
import { useAppDispatch } from "#/store";

import { Banner, ItemModState } from "./ModeratableItemBanner";

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
              dispatch(modRemovePost(itemView.post, false));
              presentToast(postApproved);
            } else {
              await dispatch(modRemoveComment(itemView.comment, false));
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
