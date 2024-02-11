import { styled } from "@linaria/react";
import {
  arrowDownSharp,
  arrowUndo,
  arrowUpSharp,
  bookmark,
  chevronCollapse,
  chevronDown,
  chevronExpand,
  chevronUp,
  eyeOffOutline,
  eyeOutline,
  mailOpen,
  mailUnread,
  share as shareIcon,
} from "ionicons/icons";
import React, {
  MouseEvent,
  TouchEvent,
  useCallback,
  useContext,
  useMemo,
} from "react";
import SlidingItem, { ActionList, SlidingItemAction } from "./SlidingItem";
import {
  CommentReplyView,
  CommentView,
  PersonMentionView,
  PostView,
} from "lemmy-js-client";
import { useAppDispatch, useAppSelector } from "../../../store";
import { savePost, voteOnPost } from "../../post/postSlice";
import {
  postLocked,
  saveSuccess,
  voteError,
} from "../../../helpers/toastMessages";
import {
  saveComment,
  updateCommentCollapseState,
  voteOnComment,
} from "../../comment/commentSlice";
import { PageContext } from "../../auth/PageContext";
import { SwipeAction, SwipeActions } from "../../../services/db";
import useCollapseRootComment from "../../comment/useCollapseRootComment";
import { getInboxItemId, markRead } from "../../inbox/inboxSlice";
import { CommentsContext } from "../../comment/CommentsContext";
import useAppToast from "../../../helpers/useAppToast";
import { share } from "../../../helpers/lemmy";
import { scrollViewUpIfNeeded } from "../../comment/CommentTree";

const StyledItemContainer = styled.div`
  --ion-item-border-color: transparent;
`;

type SlideableItem =
  | CommentView
  | PostView
  | PersonMentionView
  | CommentReplyView;

function isInboxItem(
  item: SlideableItem,
): item is PersonMentionView | CommentReplyView {
  if ("person_mention" in item) return true;
  if ("comment_reply" in item) return true;
  return false;
}

interface BaseSlidingVoteProps {
  children: React.ReactNode;
  className?: string;
  item: SlideableItem;
  rootIndex?: number;
  collapsed?: boolean;
  actions: SwipeActions;
  onHide?: () => void;
}

export default function BaseSlidingVote(props: BaseSlidingVoteProps) {
  const disableSwipes = useAppSelector(
    (state) =>
      state.gesture.swipe.disableLeftSwipes &&
      state.gesture.swipe.disableRightSwipes,
  );

  if (!disableSwipes) {
    return <BaseSlidingVoteInternal {...props} />;
  } else {
    // don't initialize all the sliding stuff if it's completely unused
    return (
      <StyledItemContainer className={props.className}>
        {props.children}
      </StyledItemContainer>
    );
  }
}

function BaseSlidingVoteInternal({
  children,
  className,
  item,
  rootIndex,
  collapsed,
  actions,
  onHide,
}: BaseSlidingVoteProps) {
  const { presentLoginIfNeeded, presentCommentReply } = useContext(PageContext);
  const { prependComments } = useContext(CommentsContext);

  const presentToast = useAppToast();
  const dispatch = useAppDispatch();

  const postVotesById = useAppSelector((state) => state.post.postVotesById);
  const commentVotesById = useAppSelector(
    (state) => state.comment.commentVotesById,
  );
  const typedMyVote = item.my_vote as 1 | -1 | 0 | undefined;
  const isPost = "unread_comments" in item;
  const currentVote = isPost
    ? postVotesById[item.post.id] ?? typedMyVote
    : commentVotesById[item.comment.id] ?? typedMyVote;

  const postSavedById = useAppSelector((state) => state.post.postSavedById);
  const commentSavedById = useAppSelector(
    (state) => state.comment.commentSavedById,
  );

  const isHidden = useAppSelector(
    (state) => state.post.postHiddenById[item.post?.id]?.hidden,
  );

  const readByInboxItemId = useAppSelector(
    (state) => state.inbox.readByInboxItemId,
  );

  const disableLeftSwipes = useAppSelector(
    (state) => state.gesture.swipe.disableLeftSwipes,
  );
  const disableRightSwipes = useAppSelector(
    (state) => state.gesture.swipe.disableRightSwipes,
  );

  const onVote = useCallback(
    async (score: 1 | -1 | 0) => {
      if (presentLoginIfNeeded()) return;

      if (isInboxItem(item)) dispatch(markRead(item, true));

      try {
        if (isPost) await dispatch(voteOnPost(item.post.id, score));
        else await dispatch(voteOnComment(item.comment.id, score));
      } catch (error) {
        presentToast(voteError);
      }
    },
    [presentLoginIfNeeded, isPost, dispatch, item, presentToast],
  );

  const reply = useCallback(async () => {
    if (presentLoginIfNeeded()) return;

    if (isInboxItem(item)) dispatch(markRead(item, true));

    if (item.post.locked) {
      presentToast(postLocked);
      return;
    }

    const reply = await presentCommentReply(item);
    if (!isPost && reply) prependComments([reply]);
  }, [
    item,
    isPost,
    presentCommentReply,
    presentLoginIfNeeded,
    prependComments,
    presentToast,
    dispatch,
  ]);

  const { id, isSaved } = useMemo(() => {
    if (isPost) {
      const id = item.post.id;
      return { id: id, isSaved: postSavedById[id] };
    } else {
      const id = item.comment.id;
      return { id: id, isSaved: commentSavedById[id] };
    }
  }, [item, isPost, postSavedById, commentSavedById]);

  const save = useCallback(async () => {
    if (presentLoginIfNeeded()) return;
    try {
      await dispatch((isPost ? savePost : saveComment)(id, !isSaved));

      if (!isSaved) presentToast(saveSuccess);
    } catch (error) {
      presentToast({
        message: "Failed to mark item as saved",
        color: "danger",
      });
      throw error;
    }
  }, [presentLoginIfNeeded, dispatch, isPost, id, isSaved, presentToast]);

  const saveAction = useMemo(() => {
    return {
      icon: bookmark,
      trigger: save,
      bgColor: "success",
      slash: isSaved,
    };
  }, [save, isSaved]);

  const hideAction = useMemo(() => {
    return onHide
      ? {
          icon: isHidden ? eyeOutline : eyeOffOutline,
          trigger: () => {
            if (presentLoginIfNeeded()) return;
            onHide();
          },
          bgColor: isHidden ? "tertiary" : "danger",
        }
      : undefined;
  }, [presentLoginIfNeeded, isHidden, onHide]);

  const collapseRootComment = useCollapseRootComment(
    !isPost ? item : undefined,
    rootIndex,
  );
  const collapseToTopAction = useMemo(() => {
    return collapseRootComment
      ? {
          icon: collapsed ? chevronExpand : chevronCollapse,
          trigger: collapseRootComment,
          bgColor: "tertiary",
        }
      : undefined;
  }, [collapsed, collapseRootComment]);

  const collapse = useCallback(
    (e: TouchEvent | MouseEvent) => {
      if (isPost) return;

      dispatch(
        updateCommentCollapseState({
          commentId: item.comment.id,
          collapsed: !collapsed,
        }),
      );

      if (e.target) scrollViewUpIfNeeded(e.target);
    },
    [collapsed, dispatch, isPost, item],
  );
  const collapseAction = useMemo(() => {
    return {
      icon: collapsed ? chevronDown : chevronUp,
      trigger: collapse,
      bgColor: "tertiary",
    };
  }, [collapsed, collapse]);

  const isRead = useMemo(() => {
    return isInboxItem(item) ? readByInboxItemId[getInboxItemId(item)] : false;
  }, [item, readByInboxItemId]);

  const markUnread = useCallback(async () => {
    if (!isInboxItem(item)) return;

    try {
      await dispatch(markRead(item, !isRead));
    } catch (error) {
      presentToast({
        message: "Failed to mark item as unread",
        color: "danger",
      });
      throw error;
    }
  }, [dispatch, presentToast, item, isRead]);

  const markUnreadAction = useMemo(() => {
    return {
      icon: isRead ? mailUnread : mailOpen,
      trigger: markUnread,
      bgColor: "primary-fixed",
    };
  }, [markUnread, isRead]);

  const shareTrigger = useCallback(async () => {
    share(isPost ? item.post : item.comment);
  }, [isPost, item]);

  const allActions: Record<SwipeAction, SlidingItemAction | undefined> =
    useMemo(() => {
      return {
        none: undefined,
        upvote: {
          icon: arrowUpSharp,
          trigger: () => {
            onVote(currentVote === 1 ? 0 : 1);
          },
          bgColor: "primary-fixed",
          slash: currentVote === 1,
        },
        downvote: {
          icon: arrowDownSharp,
          trigger: () => {
            onVote(currentVote === -1 ? 0 : -1);
          },
          bgColor: "danger",
          slash: currentVote === -1,
        },
        reply: {
          icon: arrowUndo,
          trigger: reply,
          bgColor: "primary-fixed",
        },
        save: saveAction,
        hide: hideAction,
        "collapse-to-top": collapseToTopAction,
        collapse: collapseAction,
        "mark-unread": markUnreadAction,
        share: {
          icon: shareIcon,
          trigger: shareTrigger,
          bgColor: "primary-fixed",
        },
      };
    }, [
      currentVote,
      reply,
      saveAction,
      hideAction,
      collapseAction,
      collapseToTopAction,
      markUnreadAction,
      onVote,
      shareTrigger,
    ]);

  const startActions: ActionList = useMemo(
    () =>
      !disableLeftSwipes
        ? [allActions[actions.start], allActions[actions.farStart]]
        : [undefined, undefined],
    [disableLeftSwipes, allActions, actions],
  );

  const endActions: ActionList = useMemo(
    () =>
      !disableRightSwipes
        ? [allActions[actions.end], allActions[actions.farEnd]]
        : [undefined, undefined],
    [disableRightSwipes, allActions, actions],
  );

  return (
    <SlidingItem
      startActions={startActions}
      endActions={endActions}
      className={className}
    >
      {children}
    </SlidingItem>
  );
}
