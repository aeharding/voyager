import { IonIcon, IonItem, IonSpinner } from "@ionic/react";
import { chevronDown } from "ionicons/icons";
import { CommentView } from "lemmy-js-client";
import { useContext, useState } from "react";
import AnimateHeight from "react-animate-height";

import CommentContainer from "#/features/comment/elements/CommentContainer";
import { PositionedContainer } from "#/features/comment/elements/PositionedContainer";
import {
  defaultThreadCollapse,
  OCommentThreadCollapse,
} from "#/features/settings/settingsSlice";
import { cx } from "#/helpers/css";
import { MAX_DEFAULT_COMMENT_DEPTH } from "#/helpers/lemmy";
import useAppToast from "#/helpers/useAppToast";
import useClient from "#/helpers/useClient";
import { useAppDispatch, useAppSelector } from "#/store";

import { receivedComments } from "../commentSlice";
import CommentHr from "./CommentHr";
import { CommentsContext } from "./CommentsContext";

import commentStyles from "../Comment.module.css";
import styles from "./CommentExpander.module.css";

interface CommentExpanderProps {
  depth: number;
  absoluteDepth: number;
  comment: CommentView;
  missing: number;
  collapsed?: boolean;
}

export default function CommentExpander({
  depth,
  absoluteDepth,
  comment,
  missing,
  collapsed,
}: CommentExpanderProps) {
  const presentToast = useAppToast();
  const { appendComments } = useContext(CommentsContext);
  const client = useClient();
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const collapseThreads = useAppSelector(defaultThreadCollapse);

  async function fetchChildren() {
    if (loading) return;

    setLoading(true);

    let response;

    try {
      response = await client.getComments({
        parent_id: comment.comment.id,
        type_: "All",
        max_depth:
          collapseThreads === OCommentThreadCollapse.All
            ? 1
            : Math.max((depth += 2), MAX_DEFAULT_COMMENT_DEPTH),
      });
    } catch (error) {
      presentToast({
        message: "Problem fetching more comments. Please try again.",
        color: "danger",
      });
      throw error;
    } finally {
      setLoading(false);
    }

    if (response.comments.length === 0) {
      presentToast({
        message: `Uh-oh. Looks like Lemmy returned 0 comments, but there's actually ${missing}`,
        color: "danger",
      });
      return;
    }

    dispatch(receivedComments(response.comments));
    appendComments(response.comments);
  }

  return (
    <AnimateHeight duration={200} height={collapsed ? 0 : "auto"}>
      <CommentHr depth={depth + 1} />
      <IonItem
        className={commentStyles.commentItem}
        href={undefined}
        onClick={fetchChildren}
      >
        <PositionedContainer
          depth={absoluteDepth === depth ? depth + 1 : depth + 2}
        >
          <CommentContainer depth={absoluteDepth + 1} hidden={loading}>
            <div
              className={cx(styles.moreRepliesBlock, loading && styles.hidden)}
            >
              {missing} more {missing === 1 ? "reply" : "replies"}
              <IonIcon className={styles.chevronIcon} icon={chevronDown} />
            </div>
            {loading && <IonSpinner className={styles.spinner} />}
          </CommentContainer>
        </PositionedContainer>
      </IonItem>
    </AnimateHeight>
  );
}
