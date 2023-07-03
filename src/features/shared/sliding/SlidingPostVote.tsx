import { useIonModal } from "@ionic/react";
import { arrowUndo, eyeOffOutline, eyeOutline } from "ionicons/icons";
import React, { useContext, useMemo } from "react";
import { SlidingItemAction } from "./SlidingItem";
import { CommentView, PostView } from "lemmy-js-client";
import CommentReply from "../../comment/reply/CommentReply";
import { PageContext } from "../../auth/PageContext";
import { FeedContext } from "../../feed/FeedContext";
import BaseSlidingVote from "./BaseSlidingVote";
import { useAppSelector } from "../../../store";
import { jwtSelector } from "../../auth/authSlice";
import Login from "../../auth/Login";
import { postHiddenByIdSelector } from "../../post/postSlice";

interface SlidingVoteProps {
  children: React.ReactNode;
  className?: string;
  item: CommentView | PostView;
  onHide: () => void;
}

export default function SlidingVote({
  children,
  className,
  item,
  onHide,
}: SlidingVoteProps) {
  const { refresh: refreshPost } = useContext(FeedContext);
  const pageContext = useContext(PageContext);
  const jwt = useAppSelector(jwtSelector);
  const isHidden = useAppSelector(postHiddenByIdSelector)[item.post?.id];
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

    if (jwt && "post" in item) {
      actionsList.push({
        render: isHidden ? eyeOutline : eyeOffOutline,
        trigger: onHide,
        bgColor: isHidden ? "tertiary" : "danger",
      });
    }

    return actionsList as
      | [SlidingItemAction, SlidingItemAction]
      | [SlidingItemAction];
  }, [isHidden, item, jwt, login, onHide, pageContext.page, reply]);

  return (
    <BaseSlidingVote endActions={endActions} className={className} item={item}>
      {children}
    </BaseSlidingVote>
  );
}
