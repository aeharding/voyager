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
import { useContext, useMemo } from "react";

import { PageContext } from "#/features/auth/PageContext";
import { VOTE_COLORS } from "#/features/settings/appearance/themes/votesTheme/VotesTheme";
import { SwipeAction, SwipeActions } from "#/services/db";
import { useAppSelector } from "#/store";

import SlidingItem, { ActionList, SlidingItemAction } from "../SlidingItem";

export interface GenericBaseSlidingProps {
  currentVote: 1 | -1 | 0 | undefined;
  onVote: (vote: 1 | -1 | 0) => Promise<void>;
  reply: () => Promise<void>;
  isRead: boolean | undefined;
  markUnread: () => Promise<void>;
  collapse: (e: TouchEvent | MouseEvent) => void;
  collapseRootComment: () => void;
  save: () => Promise<void>;
  isHidden: boolean | undefined;
  shareTrigger: () => void;
  collapsed?: boolean;
  isSaved: boolean | undefined;
  onHide?: () => void;
  actions: SwipeActions;
  className?: string;
  children?: React.ReactNode;
}

export default function GenericBaseSliding({
  currentVote,
  onVote,
  reply,
  isRead,
  markUnread,
  collapse,
  collapseRootComment,
  save,
  isHidden,
  shareTrigger,
  collapsed,
  isSaved,
  onHide,
  actions,
  className,
  children,
}: GenericBaseSlidingProps) {
  const { presentLoginIfNeeded } = useContext(PageContext);

  const votesTheme = useAppSelector(
    (state) => state.settings.appearance.votesTheme,
  );

  const disableLeftSwipes = useAppSelector(
    (state) => state.gesture.swipe.disableLeftSwipes,
  );
  const disableRightSwipes = useAppSelector(
    (state) => state.gesture.swipe.disableRightSwipes,
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

  const collapseAction = useMemo(() => {
    return {
      icon: collapsed ? chevronDown : chevronUp,
      trigger: collapse,
      bgColor: "tertiary",
    };
  }, [collapsed, collapse]);

  const markUnreadAction = useMemo(() => {
    return {
      icon: isRead ? mailUnread : mailOpen,
      trigger: markUnread,
      bgColor: "primary-fixed",
    };
  }, [markUnread, isRead]);

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

  const allActions: Record<SwipeAction, SlidingItemAction | undefined> =
    useMemo(() => {
      return {
        none: undefined,
        upvote: {
          icon: arrowUpSharp,
          trigger: () => {
            onVote(currentVote === 1 ? 0 : 1);
          },
          bgColor: VOTE_COLORS.UPVOTE[votesTheme],
          slash: currentVote === 1,
        },
        downvote: {
          icon: arrowDownSharp,
          trigger: () => {
            onVote(currentVote === -1 ? 0 : -1);
          },
          bgColor: VOTE_COLORS.DOWNVOTE[votesTheme],
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
      votesTheme,
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
