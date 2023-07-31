import { useIonToast } from "@ionic/react";
import {
  arrowDownSharp,
  arrowUndo,
  arrowUpSharp,
  bookmark,
  chevronCollapse,
  chevronExpand,
  eyeOffOutline,
  eyeOutline,
  mailUnread,
} from "ionicons/icons";
import React, { useCallback, useContext, useMemo } from "react";
import SlidingItem, { ActionList, SlidingItemAction } from "./SlidingItem";
import {
  CommentReplyView,
  CommentView,
  PersonMentionView,
  PostView,
} from "lemmy-js-client";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
  postHiddenByIdSelector,
  savePost,
  voteOnPost,
} from "../../post/postSlice";
import { voteError } from "../../../helpers/toastMessages";
import { saveComment, voteOnComment } from "../../comment/commentSlice";
import { PageContext } from "../../auth/PageContext";
import { SwipeAction, SwipeActions } from "../../../services/db";
import useCollapseRootComment from "../../comment/useCollapseRootComment";
import { getInboxItemId, markRead } from "../../inbox/inboxSlice";
import { CommentsContext } from "../../comment/CommentsContext";
import styled from "@emotion/styled";

const StyledItemContainer = styled.div`
  --ion-item-border-color: transparent;
`;

type SlideableItem =
  | CommentView
  | PostView
  | PersonMentionView
  | CommentReplyView;

function isInboxItem(
  item: SlideableItem
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
      state.gesture.swipe.disableRightSwipes
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

  const [present] = useIonToast();
  const dispatch = useAppDispatch();

  const postVotesById = useAppSelector((state) => state.post.postVotesById);
  const commentVotesById = useAppSelector(
    (state) => state.comment.commentVotesById
  );
  const typedMyVote = item.my_vote as 1 | -1 | 0 | undefined;
  const isPost = "unread_comments" in item;
  const currentVote = isPost
    ? postVotesById[item.post.id] ?? typedMyVote
    : commentVotesById[item.comment.id] ?? typedMyVote;

  const postSavedById = useAppSelector((state) => state.post.postSavedById);
  const commentSavedById = useAppSelector(
    (state) => state.comment.commentSavedById
  );

  const isHidden = useAppSelector(postHiddenByIdSelector)[item.post?.id];

  const readByInboxItemId = useAppSelector(
    (state) => state.inbox.readByInboxItemId
  );

  const disableLeftSwipes = useAppSelector(
    (state) => state.gesture.swipe.disableLeftSwipes
  );
  const disableRightSwipes = useAppSelector(
    (state) => state.gesture.swipe.disableRightSwipes
  );

  const onVote = useCallback(
    async (score: 1 | -1 | 0) => {
      if (presentLoginIfNeeded()) return;

      try {
        if (isPost) await dispatch(voteOnPost(item.post.id, score));
        else await dispatch(voteOnComment(item.comment.id, score));
      } catch (error) {
        present(voteError);
      }
    },
    [dispatch, isPost, item, present, presentLoginIfNeeded]
  );

  const reply = useCallback(async () => {
    if (presentLoginIfNeeded()) return;
    const reply = await presentCommentReply(item);
    if (!isPost && reply) prependComments([reply]);
  }, [
    item,
    isPost,
    presentCommentReply,
    presentLoginIfNeeded,
    prependComments,
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
    } catch (error) {
      present({
        message: "Failed to mark item as saved",
        duration: 3500,
        position: "bottom",
        color: "danger",
      });
      throw error;
    }
  }, [presentLoginIfNeeded, dispatch, isPost, id, isSaved, present]);

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
    rootIndex
  );
  const collapseAction = useMemo(() => {
    return collapseRootComment
      ? {
          icon: collapsed ? chevronExpand : chevronCollapse,
          trigger: collapseRootComment,
          bgColor: "tertiary",
        }
      : undefined;
  }, [collapsed, collapseRootComment]);

  const isRead = useMemo(() => {
    return isInboxItem(item) ? readByInboxItemId[getInboxItemId(item)] : false;
  }, [item, readByInboxItemId]);

  const markUnread = useCallback(async () => {
    if (!isInboxItem(item)) return;

    try {
      await dispatch(markRead(item, !isRead));
    } catch (error) {
      present({
        message: "Failed to mark item as unread",
        duration: 3500,
        position: "bottom",
        color: "danger",
      });
      throw error;
    }
  }, [dispatch, present, item, isRead]);

  const markUnreadAction = useMemo(() => {
    return {
      icon: mailUnread,
      trigger: markUnread,
      bgColor: "primaryfixed",
      slash: !isRead,
    };
  }, [markUnread, isRead]);

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
        collapse: collapseAction,
        mark_unread: markUnreadAction,
      };
    }, [
      currentVote,
      reply,
      saveAction,
      hideAction,
      collapseAction,
      markUnreadAction,
      onVote,
    ]);

  const startActions: ActionList = useMemo(
    () =>
      !disableLeftSwipes
        ? [allActions[actions.start], allActions[actions.farStart]]
        : [undefined, undefined],
    [disableLeftSwipes, allActions, actions]
  );

  const endActions: ActionList = useMemo(
    () =>
      !disableRightSwipes
        ? [allActions[actions.end], allActions[actions.farEnd]]
        : [undefined, undefined],
    [disableRightSwipes, allActions, actions]
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
