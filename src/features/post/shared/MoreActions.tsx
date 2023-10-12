import {
  IonButton,
  IonIcon,
  useIonActionSheet,
  useIonRouter,
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
import { useContext } from "react";
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
import useAppToast from "../../../helpers/useAppToast";

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
  const [presentSecondaryActionSheet] = useIonActionSheet();
  const presentToast = useAppToast();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const dispatch = useAppDispatch();
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

  function onClick() {
    presentActionSheet({
      cssClass: "left-align-buttons",
      buttons: [
        {
          text: myVote !== 1 ? "Upvote" : "Undo Upvote",
          icon: arrowUpOutline,
          handler: () => {
            (async () => {
              if (presentLoginIfNeeded()) return;

              try {
                await dispatch(voteOnPost(post.post.id, myVote === 1 ? 0 : 1));
              } catch (error) {
                presentToast(voteError);

                throw error;
              }
            })();
          },
        },
        downvoteAllowed
          ? {
              text: myVote !== -1 ? "Downvote" : "Undo Downvote",
              icon: arrowDownOutline,
              handler: () => {
                (async () => {
                  if (presentLoginIfNeeded()) return;

                  try {
                    await dispatch(
                      voteOnPost(post.post.id, myVote === -1 ? 0 : -1),
                    );
                  } catch (error) {
                    presentToast(voteError);

                    throw error;
                  }
                })();
              },
            }
          : undefined,
        {
          text: !mySaved ? "Save" : "Unsave",
          icon: bookmarkOutline,
          handler: () => {
            (async () => {
              if (presentLoginIfNeeded()) return;

              try {
                await dispatch(savePost(post.post.id, !mySaved));
              } catch (error) {
                presentToast(saveError);

                throw error;
              }
            })();
          },
        },
        isMyPost
          ? {
              text: "Delete",
              icon: trashOutline,
              handler: () => {
                presentSecondaryActionSheet({
                  buttons: [
                    {
                      text: "Delete Post",
                      role: "destructive",
                      handler: () => {
                        (async () => {
                          await dispatch(deletePost(post.post.id));

                          presentToast({
                            message: "Post deleted",
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
              },
            }
          : undefined,
        isMyPost
          ? {
              text: "Edit",
              icon: pencilOutline,
              handler: () => {
                presentPostEditor(post);
              },
            }
          : undefined,
        {
          text: "Reply",
          icon: arrowUndoOutline,
          handler: () => {
            if (presentLoginIfNeeded()) return;

            // Not viewing comments, so no feed update
            presentCommentReply(post);
          },
        },
        {
          text: getHandle(post.creator),
          icon: personOutline,
          handler: () => {
            router.push(
              buildGeneralBrowseLink(`/u/${getHandle(post.creator)}`),
            );
          },
        },
        {
          text: getHandle(post.community),
          icon: peopleOutline,
          handler: () => {
            router.push(
              buildGeneralBrowseLink(`/c/${getHandle(post.community)}`),
            );
          },
        },
        post.post.body
          ? {
              text: "Select Text",
              icon: textOutline,
              handler: () => {
                if (!post.post.body) return;

                presentSelectText(post.post.body);
              },
            }
          : undefined,
        onFeed
          ? {
              text: isHidden ? "Unhide" : "Hide",
              icon: isHidden ? eyeOutline : eyeOffOutline,
              handler: () => {
                if (presentLoginIfNeeded()) return;

                const fn = isHidden ? unhidePost : hidePost;

                dispatch(fn(post.post.id));
              },
            }
          : undefined,
        {
          text: "Share",
          data: "share",
          icon: shareOutline,
          handler: () => {
            share(post.post);
          },
        },
        {
          text: "Report",
          data: "report",
          icon: flagOutline,
          handler: () => {
            presentReport(post);
          },
        },
        {
          text: "Cancel",
          role: "cancel",
        },
      ].filter(notEmpty),
    });
  }

  const Button = onFeed ? ActionButton : IonButton;

  return (
    <>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <IonIcon className={className} icon={ellipsisHorizontal} />
      </Button>
    </>
  );
}
