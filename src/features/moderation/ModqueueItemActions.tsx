import { IonIcon } from "@ionic/react";
import { checkmarkCircleOutline, trashOutline } from "ionicons/icons";
import { CommentView, PostView } from "lemmy-js-client";
import { useAppDispatch } from "../../store";
import { modRemoveComment } from "../comment/commentSlice";
import { modRemovePost } from "../post/postSlice";
import useAppToast from "../../helpers/useAppToast";
import {
  commentApproved,
  commentRemoved,
  commentRestored,
  postApproved,
  postRemoved,
  postRestored,
} from "../../helpers/toastMessages";
import useCanModerate, { getModColor } from "./useCanModerate";
import { ActionButton } from "../post/actions/ActionButton";
import { resolveCommentReport, resolvePostReport } from "./modSlice";
import { isPost } from "../../helpers/lemmy";

interface ModqueueItemActionsProps {
  item: PostView | CommentView;
}

export default function ModqueueItemActions({
  item,
}: ModqueueItemActionsProps) {
  const dispatch = useAppDispatch();
  const presentToast = useAppToast();
  const canModerate = useCanModerate(item.community);

  async function modRemoveItem(remove: boolean) {
    const id = isPost(item) ? item.post.id : item.comment.id;
    const isAlreadyRemoved = isPost(item)
      ? item.post.removed
      : item.comment.removed;

    // If removal status already in the state you want, just resolve reports
    if (remove === isAlreadyRemoved) {
      const action = isPost(item) ? resolvePostReport : resolveCommentReport;
      await dispatch(action(id));

      if (remove) presentToast(isPost(item) ? postRemoved : commentRemoved);
      else presentToast(isPost(item) ? postApproved : commentApproved);

      return;
    }

    const action = isPost(item) ? modRemovePost : modRemoveComment;

    await dispatch(action(id, remove));

    const toastMessage = (() => {
      if (remove) {
        if (isPost(item)) return postRemoved;
        else return commentRemoved;
      } else {
        if (isPost(item)) return postRestored;
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
