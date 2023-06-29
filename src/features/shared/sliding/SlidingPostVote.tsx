import { useIonModal } from "@ionic/react";
import { arrowUndo, eyeOffOutline, eyeOutline } from "ionicons/icons";
import React, { useContext, useMemo } from "react";
import { SlidingItemAction } from "./SlidingItem";
import { CommentView, PostView } from "lemmy-js-client";
import CommentReply from "../../comment/reply/CommentReply";
import { PageContext } from "../../auth/PageContext";
import { FeedContext } from "../../feed/FeedContext";
import BaseSlidingVote from "./BaseSlidingVote";
import { useAppDispatch, useAppSelector } from "../../../store";
import { jwtSelector } from "../../auth/authSlice";
import Login from "../../auth/Login";
import {
  hiddenPostsSelector,
  hidePost,
  unhidePost,
} from "../../post/postSlice";

interface SlidingVoteProps {
  children: React.ReactNode;
  className?: string;
  item: CommentView | PostView;
}

export default function SlidingVote({
  children,
  className,
  item,
}: SlidingVoteProps) {
  const { refresh: refreshPost } = useContext(FeedContext);
  const pageContext = useContext(PageContext);
  const dispatch = useAppDispatch();
  const jwt = useAppSelector(jwtSelector);
  const isHidden = useAppSelector(hiddenPostsSelector).includes(item.post?.id);

  const [login, onDismissLogin] = useIonModal(Login, {
    onDismiss: (data: string, role: string) => onDismissLogin(data, role),
  });

  const [reply, onDismissReply] = useIonModal(CommentReply, {
    onDismiss: (data: string, role: string) => {
      if (role === "post") refreshPost();
      onDismissReply(data, role);
    },
    item,
  });

  const endActions = useMemo(() => {
    const actionsList = [
      {
        render: arrowUndo,
        trigger: () => {
          if (!jwt) return login({ presentingElement: pageContext.page });

          reply({ presentingElement: pageContext.page });
        },
        bgColor: "primary",
      },
    ];

    if ("post" in item) {
      actionsList.push({
        render: isHidden ? eyeOutline : eyeOffOutline,
        trigger: () => {
          if (isHidden) {
            dispatch(unhidePost(item.post.id));
          } else {
            dispatch(hidePost(item.post.id));
          }
        },
        bgColor: "danger",
      });
    }

    return actionsList as
      | [SlidingItemAction, SlidingItemAction]
      | [SlidingItemAction];
  }, [dispatch, isHidden, item, jwt, login, pageContext.page, reply]);

  return (
    <BaseSlidingVote endActions={endActions} className={className} item={item}>
      {children}
    </BaseSlidingVote>
  );
}
