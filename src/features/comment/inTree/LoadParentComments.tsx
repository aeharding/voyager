import { IonIcon, IonItem } from "@ionic/react";
import { chevronUp } from "ionicons/icons";

import CommentContainer from "#/features/comment/elements/CommentContainer";
import { PositionedContainer } from "#/features/comment/elements/PositionedContainer";

import CommentHr from "./CommentHr";

import commentStyles from "../Comment.module.css";
import styles from "./LoadParentComments.module.css";

interface LoadParentCommentsProps {
  setMaxContext: React.Dispatch<React.SetStateAction<number>>;
}

export default function LoadParentComments({
  setMaxContext,
}: LoadParentCommentsProps) {
  return (
    <>
      <IonItem
        className={commentStyles.commentItem}
        onClick={() => {
          setMaxContext((maxContext) => maxContext - 5);
        }}
      >
        <PositionedContainer depth={0}>
          <CommentContainer depth={0}>
            <div className={styles.moreRepliesBlock}>
              <IonIcon icon={chevronUp} className={styles.chevronIcon} />
              Load parent comments...
            </div>
          </CommentContainer>
        </PositionedContainer>
      </IonItem>
      <CommentHr depth={1} />
    </>
  );
}
