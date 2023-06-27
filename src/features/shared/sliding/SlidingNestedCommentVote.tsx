import { useIonModal } from "@ionic/react";
import { arrowUndo, chevronCollapse, chevronExpand } from "ionicons/icons";
import React, { useContext, useMemo } from "react";
import { SlidingItemAction } from "./SlidingItem";
import { CommentView } from "lemmy-js-client";
import CommentReply from "../../comment/reply/CommentReply";
import { PageContext } from "../../auth/PageContext";
import { PostContext } from "../../post/detail/PostContext";
import BaseSlidingVote from "./BaseSlidingVote";
import { useAppSelector } from "../../../store";
import { jwtSelector } from "../../auth/authSlice";
import Login from "../../auth/Login";

interface SlidingVoteProps {
  children: React.ReactNode;
  className?: string;
  item: CommentView;
  collapse: () => void;
  collapsed: boolean;
}

export default function SlidingNestedCommentVote({
  children,
  className,
  item,
  collapse,
  collapsed,
}: SlidingVoteProps) {
  const { refreshPost } = useContext(PostContext);
  const pageContext = useContext(PageContext);
  const jwt = useAppSelector(jwtSelector);

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

  const endActions: [SlidingItemAction, SlidingItemAction] = useMemo(() => {
    return [
      {
        render: collapsed ? chevronExpand : chevronCollapse,
        trigger: () => {
          collapse();
        },
        bgColor: "tertiary",
      },
      {
        render: arrowUndo,
        trigger: () => {
          if (!jwt) return login({ presentingElement: pageContext.page });

          reply({ presentingElement: pageContext.page });
        },
        bgColor: "primary",
      },
    ];
  }, [pageContext.page, reply, jwt, login, collapse, collapsed]);

  return (
    <BaseSlidingVote endActions={endActions} className={className} item={item}>
      {children}
    </BaseSlidingVote>
  );
}
