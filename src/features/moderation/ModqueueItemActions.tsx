import { IonIcon } from "@ionic/react";
import { checkmarkCircleOutline, trashBinOutline } from "ionicons/icons";
import { CommentView, PostView } from "lemmy-js-client";
import { useAppDispatch } from "../../store";
import { modRemoveComment } from "../comment/commentSlice";
import { isPost } from "../feed/PostCommentFeed";
import { modRemovePost } from "../post/postSlice";
import useAppToast from "../../helpers/useAppToast";
import {
  commentApproved,
  commentRemoved,
  postApproved,
  postRemoved,
} from "../../helpers/toastMessages";
import useCanModerate, { getModColor } from "./useCanModerate";

interface ModqueueItemActionsProps {
  item: PostView | CommentView;
}

export default function ModqueueItemActions({
  item,
}: ModqueueItemActionsProps) {
  const dispatch = useAppDispatch();
  const presentToast = useAppToast();
  const canModerate = useCanModerate(item.community);

  async function modRemoveItem(removed: boolean) {
    const id = isPost(item) ? item.post.id : item.comment.id;
    const action = isPost(item) ? modRemovePost : modRemoveComment;

    await dispatch(action(id, removed));

    const toastMessage = (() => {
      if (removed) {
        if (isPost(item)) return postRemoved;
        else return commentRemoved;
      } else {
        if (isPost(item)) return postApproved;
        else return commentApproved;
      }
    })();

    presentToast(toastMessage);
  }

  if (!canModerate) return;

  return (
    <>
      <IonIcon
        icon={checkmarkCircleOutline}
        onClick={(e) => {
          e.stopPropagation();
          modRemoveItem(false);
        }}
        color={getModColor(canModerate)}
      />
      <IonIcon
        icon={trashBinOutline}
        onClick={(e) => {
          e.stopPropagation();
          modRemoveItem(true);
        }}
        color={getModColor(canModerate)}
      />
    </>
  );
}
