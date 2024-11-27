import { IonIcon } from "@ionic/react";
import { checkmarkCircleOutline, trashOutline } from "ionicons/icons";
import { CommentView, PostView } from "lemmy-js-client";

import { modRemoveComment } from "#/features/comment/commentSlice";
import { ActionButton } from "#/features/post/actions/ActionButton";
import { modRemovePost } from "#/features/post/postSlice";
import { isPost } from "#/helpers/lemmy";
import {
  commentApproved,
  commentRemovedMod,
  commentRestored,
  postApproved,
  postRemovedMod,
  postRestored,
} from "#/helpers/toastMessages";
import useAppToast from "#/helpers/useAppToast";
import { useAppDispatch } from "#/store";

import { resolveCommentReport, resolvePostReport } from "./modSlice";
import useCanModerate, { getModColor } from "./useCanModerate";

interface ModqueueItemActionsProps {
  itemView: PostView | CommentView;
}

export default function ModqueueItemActions({
  itemView,
}: ModqueueItemActionsProps) {
  const dispatch = useAppDispatch();
  const presentToast = useAppToast();
  const canModerate = useCanModerate(itemView.community);

  async function modRemoveItem(remove: boolean) {
    const item = isPost(itemView) ? itemView.post : itemView.comment;
    const isAlreadyRemoved = item.removed;

    // If removal status already in the state you want, just resolve reports
    if (remove === isAlreadyRemoved) {
      const action = isPost(itemView)
        ? resolvePostReport
        : resolveCommentReport;
      await dispatch(action(item.id));

      if (remove)
        presentToast(isPost(itemView) ? postRemovedMod : commentRemovedMod);
      else presentToast(isPost(itemView) ? postApproved : commentApproved);

      return;
    }

    if (isPost(itemView)) await dispatch(modRemovePost(itemView.post, remove));
    else await dispatch(modRemoveComment(itemView.comment, remove));

    const toastMessage = (() => {
      if (remove) {
        if (isPost(itemView)) return postRemovedMod;
        else return commentRemovedMod;
      } else {
        if (isPost(itemView)) return postRestored;
        else return commentRestored;
      }
    })();

    presentToast(toastMessage);
  }

  if (!canModerate) return;

  return (
    <>
      <ActionButton
        className="large"
        onClick={(e) => {
          e.stopPropagation();
          modRemoveItem(false);
        }}
      >
        <IonIcon
          icon={checkmarkCircleOutline}
          color={getModColor(canModerate)}
        />
      </ActionButton>
      <ActionButton
        className="large"
        onClick={(e) => {
          e.stopPropagation();
          modRemoveItem(true);
        }}
      >
        <IonIcon icon={trashOutline} color={getModColor(canModerate)} />
      </ActionButton>
    </>
  );
}
