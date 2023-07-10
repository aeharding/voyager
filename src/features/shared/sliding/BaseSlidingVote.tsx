import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { IonIcon, useIonToast } from "@ionic/react";
import {
  arrowDownSharp,
  arrowUndo,
  arrowUpSharp,
  chevronCollapse,
  chevronExpand,
  eyeOffOutline,
  eyeOutline,
  mailUnread,
} from "ionicons/icons";
import React, { useCallback, useContext, useMemo } from "react";
import SlidingItem, { SlidingItemAction } from "./SlidingItem";
import {
  CommentReplyView,
  CommentView,
  PersonMentionView,
  PostView,
} from "lemmy-js-client";
import { useAppDispatch, useAppSelector } from "../../../store";
import { postHiddenByIdSelector, voteOnPost } from "../../post/postSlice";
import { voteError } from "../../../helpers/toastMessages";
import { voteOnComment } from "../../comment/commentSlice";
import { PageContext } from "../../auth/PageContext";
import { SwipeAction, SwipeActions } from "../../../services/db";
import useCollapseRootComment from "../../comment/useCollapseRootComment";
import { getInboxItemId, markRead } from "../../inbox/inboxSlice";
import { InboxItemView } from "../../inbox/InboxItem";
import { CommentsContext } from "../../comment/CommentsContext";

const VoteArrow = styled(IonIcon)<{
  slash: boolean;
  bgColor: string;
}>`
  ${({ slash, bgColor }) =>
    slash &&
    css`
      &::after {
        content: "";
        position: absolute;
        height: 30px;
        width: 3px;
        background: white;
        font-size: 1.7em;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        transform-origin: center;
        box-shadow: 0 0 0 2px var(--ion-color-${bgColor});
      }
    `}
`;

interface BaseSlidingVoteProps {
  children: React.ReactNode;
  className?: string;
  item: CommentView | PostView | PersonMentionView | CommentReplyView;
  rootIndex?: number;
  collapsed?: boolean;
  actions: SwipeActions;
  onHide?: () => void;
}

export default function BaseSlidingVote({
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
  const isHidden = useAppSelector(postHiddenByIdSelector)[item.post?.id];

  const readByInboxItemId = useAppSelector(
    (state) => state.inbox.readByInboxItemId
  );

  const vote = useCallback(
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

  const markUnread = useCallback(async () => {
    try {
      await dispatch(
        markRead(
          item as InboxItemView,
          !readByInboxItemId[getInboxItemId(item as InboxItemView)]
        )
      );
    } catch (error) {
      present({
        message: "Failed to mark item as unread",
        duration: 3500,
        position: "bottom",
        color: "danger",
      });

      throw error;
    }
  }, [dispatch, item, present, readByInboxItemId]);

  const hideAction = useMemo(() => {
    return onHide
      ? {
          render: isHidden ? eyeOutline : eyeOffOutline,
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
          render: collapsed ? chevronExpand : chevronCollapse,
          trigger: collapseRootComment,
          bgColor: "tertiary",
        }
      : undefined;
  }, [collapsed, collapseRootComment]);

  const all_actions: {
    [id in SwipeAction]: SlidingItemAction | undefined;
  } = useMemo(() => {
    return {
      none: undefined,
      upvote: {
        render: () => (
          <VoteArrow
            slash={currentVote === 1}
            bgColor="primary"
            icon={arrowUpSharp}
          />
        ),
        trigger: () => {
          vote(currentVote === 1 ? 0 : 1);
        },
        bgColor: "primary",
      },
      downvote: {
        render: () => (
          <VoteArrow
            slash={currentVote === -1}
            bgColor="danger"
            icon={arrowDownSharp}
          />
        ),
        trigger: () => {
          vote(currentVote === -1 ? 0 : -1);
        },
        bgColor: "danger",
      },
      reply: {
        render: arrowUndo,
        trigger: reply,
        bgColor: "primary",
      },
      hide: hideAction,
      collapse: collapseAction,
      mark_unread: {
        render: mailUnread,
        trigger: markUnread,
        bgColor: "primary",
      },
    };
  }, [currentVote, reply, hideAction, collapseAction, markUnread, vote]);

  return (
    <SlidingItem
      startActions={[
        all_actions[actions["start"]],
        all_actions[actions["far_start"]],
      ]}
      endActions={[
        all_actions[actions["end"]],
        all_actions[actions["far_end"]],
      ]}
      className={className}
    >
      {children}
    </SlidingItem>
  );
}
