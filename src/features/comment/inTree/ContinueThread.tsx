import { IonIcon, IonItem } from "@ionic/react";
import { chevronForward } from "ionicons/icons";
import AnimateHeight from "react-animate-height";
import { useParams } from "react-router";

import CommentContainer from "#/features/comment/elements/CommentContainer";
import { PositionedContainer } from "#/features/comment/elements/PositionedContainer";
import { CommentNodeI } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";

import CommentHr from "./CommentHr";

import commentStyles from "../Comment.module.css";
import styles from "./ContinueThread.module.css";

interface CommentExpanderProps {
  depth: number;
  absoluteDepth?: number;
  collapsed?: boolean;
  comment: CommentNodeI;
}

export default function ContinueThread({
  depth,
  absoluteDepth,
  collapsed,
  comment,
}: CommentExpanderProps) {
  const { community, id: postId } = useParams<{
    community: string;
    id: string;
  }>();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  return (
    <AnimateHeight duration={200} height={collapsed ? 0 : "auto"}>
      <CommentHr depth={depth} />
      <IonItem
        className={commentStyles.commentItem}
        detail={false}
        routerLink={buildGeneralBrowseLink(
          `/c/${community}/comments/${postId}/thread/${comment.comment_view.comment.id}`,
        )}
      >
        <PositionedContainer
          depth={absoluteDepth === depth ? depth || 0 : (depth || 0) + 1}
        >
          <CommentContainer depth={absoluteDepth ?? depth ?? 0}>
            <div className={styles.moreRepliesBlock}>
              Continue Thread...
              <IonIcon icon={chevronForward} className={styles.chevronIcon} />
            </div>
          </CommentContainer>
        </PositionedContainer>
      </IonItem>
    </AnimateHeight>
  );
}
