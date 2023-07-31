import {
  IonActionSheet,
  IonButton,
  IonIcon,
  useIonActionSheet,
  useIonRouter,
  useIonToast,
} from "@ionic/react";
import {
  arrowDownOutline,
  arrowUndoOutline,
  arrowUpOutline,
  bookmarkOutline,
  ellipsisHorizontal,
  eyeOffOutline,
  eyeOutline,
  flagOutline,
  pencilOutline,
  peopleOutline,
  personOutline,
  shareOutline,
  textOutline,
  trashOutline,
} from "ionicons/icons";
import { useContext, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { PostView } from "lemmy-js-client";
import {
  postHiddenByIdSelector,
  hidePost,
  unhidePost,
  voteOnPost,
  savePost,
  deletePost,
} from "../postSlice";
import { getHandle, getRemoteHandle, share } from "../../../helpers/lemmy";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { notEmpty } from "../../../helpers/array";
import { PageContext } from "../../auth/PageContext";
import { saveError, voteError } from "../../../helpers/toastMessages";
import { ActionButton } from "../actions/ActionButton";
import {
  handleSelector,
  isDownvoteEnabledSelector,
} from "../../auth/authSlice";

interface MoreActionsProps {
  post: PostView;
  className?: string;
  onFeed?: boolean;
}

export default function MoreActions({
  post,
  className,
  onFeed,
}: MoreActionsProps) {
  const [presentActionSheet] = useIonActionSheet();
  const [present] = useIonToast();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const isHidden = useAppSelector(postHiddenByIdSelector)[post.post.id];
  const myHandle = useAppSelector(handleSelector);

  const router = useIonRouter();

  const {
    presentLoginIfNeeded,
    presentCommentReply,
    presentReport,
    presentPostEditor,
    presentSelectText,
  } = useContext(PageContext);

  const postVotesById = useAppSelector((state) => state.post.postVotesById);
  const postSavedById = useAppSelector((state) => state.post.postSavedById);

  const myVote = postVotesById[post.post.id] ?? post.my_vote;
  const mySaved = postSavedById[post.post.id] ?? post.saved;

  const isMyPost = getRemoteHandle(post.creator) === myHandle;
  const downvoteAllowed = useAppSelector(isDownvoteEnabledSelector);

  const buttons = useMemo(
    () =>
      [
        {
          text: myVote !== 1 ? "Upvote" : "Undo Upvote",
          data: "upvote",
          icon: arrowUpOutline,
        },
        downvoteAllowed
          ? {
              text: myVote !== -1 ? "Downvote" : "Undo Downvote",
              data: "downvote",
              icon: arrowDownOutline,
            }
          : undefined,
        {
          text: !mySaved ? "Save" : "Unsave",
          data: "save",
          icon: bookmarkOutline,
        },
        isMyPost
          ? {
              text: "Delete",
              data: "delete",
              icon: trashOutline,
            }
          : undefined,
        isMyPost
          ? {
              text: "Edit",
              data: "edit",
              icon: pencilOutline,
            }
          : undefined,
        {
          text: "Reply",
          data: "reply",
          icon: arrowUndoOutline,
        },
        {
          text: getHandle(post.creator),
          data: "person",
          icon: personOutline,
        },
        {
          text: getHandle(post.community),
          data: "community",
          icon: peopleOutline,
        },
        post.post.body
          ? {
              text: "Select Text",
              data: "select",
              icon: textOutline,
            }
          : undefined,
        onFeed
          ? {
              text: isHidden ? "Unhide" : "Hide",
              data: isHidden ? "unhide" : "hide",
              icon: isHidden ? eyeOutline : eyeOffOutline,
            }
          : undefined,
        {
          text: "Share",
          data: "share",
          icon: shareOutline,
        },
        {
          text: "Report",
          data: "report",
          icon: flagOutline,
        },
        {
          text: "Cancel",
          role: "cancel",
        },
      ].filter(notEmpty),
    [
      downvoteAllowed,
      isHidden,
      isMyPost,
      mySaved,
      myVote,
      onFeed,
      post.community,
      post.creator,
      post.post.body,
    ]
  );

  const Button = onFeed ? ActionButton : IonButton;

  return (
    <>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <IonIcon className={className} icon={ellipsisHorizontal} />
      </Button>
      <IonActionSheet
        cssClass="left-align-buttons"
        isOpen={open}
        buttons={buttons}
        onClick={(e) => e.stopPropagation()}
        onDidDismiss={() => setOpen(false)}
        onWillDismiss={async (e) => {
          switch (e.detail.data) {
            case "upvote": {
              if (presentLoginIfNeeded()) return;

              try {
                await dispatch(voteOnPost(post.post.id, myVote === 1 ? 0 : 1));
              } catch (error) {
                present(voteError);

                throw error;
              }
              break;
            }
            case "downvote": {
              if (presentLoginIfNeeded()) return;

              try {
                await dispatch(
                  voteOnPost(post.post.id, myVote === -1 ? 0 : -1)
                );
              } catch (error) {
                present(voteError);

                throw error;
              }
              break;
            }
            case "save": {
              if (presentLoginIfNeeded()) return;

              try {
                await dispatch(savePost(post.post.id, !mySaved));
              } catch (error) {
                present(saveError);

                throw error;
              }
              break;
            }
            case "reply": {
              if (presentLoginIfNeeded()) return;

              // Not viewing comments, so no feed update
              presentCommentReply(post);

              break;
            }
            case "person": {
              router.push(
                buildGeneralBrowseLink(`/u/${getHandle(post.creator)}`)
              );

              break;
            }
            case "community": {
              router.push(
                buildGeneralBrowseLink(`/c/${getHandle(post.community)}`)
              );

              break;
            }
            case "select": {
              if (!post.post.body) break;

              return presentSelectText(post.post.body);
            }
            case "hide": {
              if (presentLoginIfNeeded()) return;

              dispatch(hidePost(post.post.id));

              break;
            }
            case "unhide": {
              if (presentLoginIfNeeded()) return;

              dispatch(unhidePost(post.post.id));

              break;
            }
            case "share": {
              share(post.post);

              break;
            }
            case "report": {
              presentReport(post);
              break;
            }
            case "delete": {
              presentActionSheet({
                buttons: [
                  {
                    text: "Delete Post",
                    role: "destructive",
                    handler: () => {
                      (async () => {
                        await dispatch(deletePost(post.post.id));

                        present({
                          message: "Post deleted",
                          duration: 3500,
                          position: "bottom",
                          color: "success",
                        });
                      })();
                    },
                  },
                  {
                    text: "Cancel",
                    role: "cancel",
                  },
                ],
              });
              break;
            }
            case "edit": {
              presentPostEditor(post);
            }
          }
        }}
      />
    </>
  );
}
