import { useIonActionSheet } from "@ionic/react";
import {
  arrowDownOutline,
  arrowUndoOutline,
  arrowUpOutline,
  bookmarkOutline,
  cameraOutline,
  checkmark,
  eyeOffOutline,
  eyeOutline,
  flagOutline,
  pencilOutline,
  peopleOutline,
  personOutline,
  repeatOutline,
  shareOutline,
  textOutline,
  trashOutline,
} from "ionicons/icons";
import { useCallback, useContext } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { PostView } from "lemmy-js-client";
import {
  hidePost,
  unhidePost,
  voteOnPost,
  savePost,
  deletePost,
} from "../postSlice";
import {
  getCrosspostUrl,
  getHandle,
  getRemoteHandle,
  share,
} from "../../../helpers/lemmy";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { PageContext } from "../../auth/PageContext";
import {
  postLocked,
  saveError,
  saveSuccess,
  voteError,
} from "../../../helpers/toastMessages";
import { userHandleSelector } from "../../auth/authSelectors";
import useAppToast from "../../../helpers/useAppToast";
import usePostModActions from "../../moderation/usePostModActions";
import useCanModerate, { getModIcon } from "../../moderation/useCanModerate";
import { useOptimizedIonRouter } from "../../../helpers/useOptimizedIonRouter";
import { isDownvoteEnabledSelector } from "../../auth/siteSlice";
import { resolveObject } from "../../resolve/resolveSlice";
import { compact } from "lodash";
import { InFeedContext } from "../../feed/Feed";

export default function usePostActions(post: PostView) {
  const inFeed = useContext(InFeedContext);
  const [presentActionSheet] = useIonActionSheet();
  const [presentSecondaryActionSheet] = useIonActionSheet();
  const presentToast = useAppToast();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const dispatch = useAppDispatch();
  const isHidden = useAppSelector(
    (state) => state.post.postHiddenById[post.post.id]?.hidden,
  );
  const myHandle = useAppSelector(userHandleSelector);

  const router = useOptimizedIonRouter();

  const {
    presentLoginIfNeeded,
    presentCommentReply,
    presentReport,
    presentPostEditor,
    presentSelectText,
    presentShareAsImage,
    presentCreateCrosspost,
  } = useContext(PageContext);

  const presentPostModActions = usePostModActions(post);

  const postVotesById = useAppSelector((state) => state.post.postVotesById);
  const postSavedById = useAppSelector((state) => state.post.postSavedById);

  const myVote = postVotesById[post.post.id] ?? post.my_vote;
  const mySaved = postSavedById[post.post.id] ?? post.saved;

  const isMyPost = getRemoteHandle(post.creator) === myHandle;
  const downvoteAllowed = useAppSelector(isDownvoteEnabledSelector);

  const canModerate = useCanModerate(post.community);

  return useCallback(() => {
    presentActionSheet({
      cssClass: "left-align-buttons",
      buttons: compact([
        canModerate && {
          text: "Moderator",
          icon: getModIcon(canModerate),
          cssClass: `${canModerate} detail`,
          handler: presentPostModActions,
        },
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
        downvoteAllowed && {
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
        },
        {
          text: !mySaved ? "Save" : "Unsave",
          icon: bookmarkOutline,
          handler: () => {
            (async () => {
              if (presentLoginIfNeeded()) return;

              try {
                await dispatch(savePost(post.post.id, !mySaved));

                if (!mySaved) presentToast(saveSuccess);
              } catch (error) {
                presentToast(saveError);

                throw error;
              }
            })();
          },
        },
        isMyPost && {
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
                        centerText: true,
                        icon: checkmark,
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
        },
        isMyPost && {
          text: "Edit",
          icon: pencilOutline,
          handler: () => {
            presentPostEditor(post);
          },
        },
        {
          text: "Reply",
          icon: arrowUndoOutline,
          handler: () => {
            if (presentLoginIfNeeded()) return;
            if (post.post.locked) {
              presentToast(postLocked);
              return;
            }

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
        {
          text: "Select Text",
          icon: textOutline,
          handler: () => {
            presentSelectText(
              compact([post.post.name, post.post.body]).join("\n\n"),
            );
          },
        },
        inFeed && {
          text: isHidden ? "Unhide" : "Hide",
          icon: isHidden ? eyeOutline : eyeOffOutline,
          handler: () => {
            if (presentLoginIfNeeded()) return;

            const fn = isHidden ? unhidePost : hidePost;

            dispatch(fn(post.post.id));
          },
        },
        {
          text: "Share",
          data: "share",
          icon: shareOutline,
          handler: () => {
            share(post.post);
          },
        },
        {
          text: "Share as image...",
          icon: cameraOutline,
          handler: () => {
            presentShareAsImage(post);
          },
        },
        {
          text: "Crosspost",
          icon: repeatOutline,
          handler: () => {
            (async () => {
              if (presentLoginIfNeeded()) return;

              // If crossposting a crosspost, crosspost the original post
              const crosspostUrl = getCrosspostUrl(post.post);

              if (crosspostUrl) {
                let post;

                try {
                  ({ post } = await dispatch(resolveObject(crosspostUrl)));
                } catch (error) {
                  console.error(error);

                  // Continue silently
                }

                if (post) {
                  presentCreateCrosspost(post);

                  return;
                }
              }

              presentCreateCrosspost(post);
            })();
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
      ]),
    });
  }, [
    buildGeneralBrowseLink,
    canModerate,
    dispatch,
    downvoteAllowed,
    isHidden,
    isMyPost,
    mySaved,
    myVote,
    post,
    presentActionSheet,
    presentCommentReply,
    presentCreateCrosspost,
    presentLoginIfNeeded,
    presentPostEditor,
    presentPostModActions,
    presentReport,
    presentSecondaryActionSheet,
    presentSelectText,
    presentShareAsImage,
    presentToast,
    router,
    inFeed,
  ]);
}
