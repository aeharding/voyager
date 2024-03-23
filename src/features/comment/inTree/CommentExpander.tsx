import { CommentView } from "lemmy-js-client";
import { CustomIonItem } from "../Comment";
import CommentHr from "./CommentHr";
import { useContext, useState } from "react";
import { CommentsContext } from "./CommentsContext";
import useClient from "../../../helpers/useClient";
import { IonIcon, IonSpinner } from "@ionic/react";
import { chevronDown } from "ionicons/icons";
import AnimateHeight from "react-animate-height";
import { MAX_DEFAULT_COMMENT_DEPTH } from "../../../helpers/lemmy";
import useAppToast from "../../../helpers/useAppToast";
import { receivedComments } from "../commentSlice";
import {
  OCommentThreadCollapse,
  defaultThreadCollapse,
} from "../../settings/settingsSlice";
import { useAppDispatch, useAppSelector } from "../../../store";
import { styled } from "@linaria/react";
import { PositionedContainer } from "../elements/PositionedContainer";
import CommentContainer from "../elements/CommentContainer";

const MoreRepliesBlock = styled.div<{ hidden: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  color: var(--ion-color-primary);

  opacity: ${({ hidden }) => (hidden ? 0 : 1)};
`;

const ChevronIcon = styled(IonIcon)`
  font-size: 1rem;
`;

const StyledIonSpinner = styled(IonSpinner)`
  width: 1.25rem;
  opacity: 0.6;

  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

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
      <CustomIonItem href={undefined} onClick={fetchChildren}>
        <PositionedContainer
          depth={absoluteDepth === depth ? depth + 1 : depth + 2}
        >
          <CommentContainer depth={absoluteDepth + 1} hidden={loading}>
            <MoreRepliesBlock hidden={loading}>
              {missing} more {missing === 1 ? "reply" : "replies"}
              <ChevronIcon icon={chevronDown} />
            </MoreRepliesBlock>
            {loading && <StyledIonSpinner />}
          </CommentContainer>
        </PositionedContainer>
      </CustomIonItem>
    </AnimateHeight>
  );
}
