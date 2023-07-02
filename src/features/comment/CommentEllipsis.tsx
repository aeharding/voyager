import {
  IonActionSheet,
  IonIcon,
  useIonModal,
  useIonRouter,
  useIonToast,
} from "@ionic/react";
import {
  arrowDownOutline,
  arrowUndoOutline,
  arrowUpOutline,
  bookmarkOutline,
  chevronCollapseOutline,
  ellipsisHorizontal,
  pencilOutline,
  personOutline,
  shareOutline,
  textOutline,
  trashOutline,
} from "ionicons/icons";
import { CommentView } from "lemmy-js-client";
import { useContext, useState } from "react";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { useAppDispatch, useAppSelector } from "../../store";
import { handleSelector, jwtSelector } from "../auth/authSlice";
import { PageContext } from "../auth/PageContext";
import Login from "../auth/Login";
import CommentReply from "./reply/CommentReply";
import {
  getHandle,
  getRemoteHandle,
  canModify as isCommentMutable,
} from "../../helpers/lemmy";
import { deleteComment, saveComment, voteOnComment } from "./commentSlice";
import styled from "@emotion/styled";
import { notEmpty } from "../../helpers/array";
import CommentEditing from "./edit/CommentEdit";
import useCollapseRootComment from "./useCollapseRootComment";
import { FeedContext } from "../feed/FeedContext";
import SelectText from "../../pages/shared/SelectTextModal";

const StyledIonIcon = styled(IonIcon)`
  padding: 8px 12px;
  margin: -8px -12px;

  font-size: 1.2em;
`;

interface MoreActionsProps {
  comment: CommentView;
  rootIndex: number | undefined;
}

export default function MoreActions({ comment, rootIndex }: MoreActionsProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const jwt = useAppSelector(jwtSelector);
  const { refresh: refreshPost } = useContext(FeedContext);
  const myHandle = useAppSelector(handleSelector);
  const [present] = useIonToast();
  const collapseRootComment = useCollapseRootComment(comment, rootIndex);

  const router = useIonRouter();

  const pageContext = useContext(PageContext);
  const [login, onDismiss] = useIonModal(Login, {
    onDismiss: (data: string, role: string) => onDismiss(data, role),
  });

  const [reply, onDismissReply] = useIonModal(CommentReply, {
    onDismiss: (data: string, role: string) => {
      if (role === "post") refreshPost();
      onDismissReply(data, role);
    },
    item: comment,
  });

  const [edit, onDismissEdit] = useIonModal(CommentEditing, {
    onDismiss: (data: string, role: string) => {
      onDismissEdit(data, role);
    },
    item: comment,
  });

  const [selectText, onDismissSelectText] = useIonModal(SelectText, {
    text: comment.comment.content,
    onDismiss: (data: string, role: string) => onDismissSelectText(data, role),
  });

  const commentVotesById = useAppSelector(
    (state) => state.comment.commentVotesById
  );
  const commentSavedById = useAppSelector(
    (state) => state.comment.commentSavedById
  );

  const myVote = commentVotesById[comment.comment.id] ?? comment.my_vote;
  const mySaved = commentSavedById[comment.comment.id] ?? comment.saved;

  const isMyComment = getRemoteHandle(comment.creator) === myHandle;

  return (
    <>
      <StyledIonIcon
        icon={ellipsisHorizontal}
        onClick={(e) => {
          setOpen(true);
          e.stopPropagation();
        }}
      />

      <IonActionSheet
        cssClass="left-align-buttons"
        onClick={(e) => e.stopPropagation()}
        isOpen={open}
        buttons={[
          {
            text: myVote !== 1 ? "Upvote" : "Undo Upvote",
            role: "upvote",
            icon: arrowUpOutline,
          },
          {
            text: myVote !== -1 ? "Downvote" : "Undo Downvote",
            role: "downvote",
            icon: arrowDownOutline,
          },
          {
            text: !mySaved ? "Save" : "Unsave",
            role: "save",
            icon: bookmarkOutline,
          },
          isMyComment && isCommentMutable(comment)
            ? {
                text: "Edit",
                role: "edit",
                icon: pencilOutline,
              }
            : undefined,
          isMyComment && isCommentMutable(comment)
            ? {
                text: "Delete",
                role: "delete",
                icon: trashOutline,
              }
            : undefined,
          {
            text: "Reply",
            role: "reply",
            icon: arrowUndoOutline,
          },
          {
            text: "Select Text",
            role: "select-text",
            icon: textOutline,
          },
          {
            text: getHandle(comment.creator),
            role: "person",
            icon: personOutline,
          },
          {
            text: "Share",
            role: "share",
            icon: shareOutline,
          },
          rootIndex !== undefined
            ? {
                text: "Collapse to Top",
                role: "collapse",
                icon: chevronCollapseOutline,
              }
            : undefined,
          {
            text: "Cancel",
            role: "cancel",
          },
        ].filter(notEmpty)}
        onWillDismiss={async (e) => {
          setOpen(false);

          switch (e.detail.role) {
            case "upvote":
              if (!jwt) return login({ presentingElement: pageContext.page });

              dispatch(voteOnComment(comment.comment.id, myVote === 1 ? 0 : 1));
              break;
            case "downvote":
              if (!jwt) return login({ presentingElement: pageContext.page });

              dispatch(
                voteOnComment(comment.comment.id, myVote === -1 ? 0 : -1)
              );
              break;
            case "save":
              if (!jwt) return login({ presentingElement: pageContext.page });

              dispatch(saveComment(comment.comment.id, !mySaved));
              break;
            case "edit":
              edit({ presentingElement: pageContext.page });
              break;
            case "delete":
              try {
                await dispatch(deleteComment(comment.comment.id));
              } catch (error) {
                present({
                  message: "Problem deleting comment. Please try again.",
                  duration: 3500,
                  position: "bottom",
                  color: "danger",
                });

                throw error;
              }

              present({
                message: "Comment deleted!",
                duration: 3500,
                position: "bottom",
                color: "primary",
              });
              break;
            case "reply":
              if (!jwt) return login({ presentingElement: pageContext.page });

              reply({ presentingElement: pageContext.page });
              break;
            case "select-text":
              return selectText({
                presentingElement: pageContext.page,
              });
            case "person":
              router.push(
                buildGeneralBrowseLink(`/u/${getHandle(comment.creator)}`)
              );
              break;
            case "share":
              navigator.share({ url: comment.comment.ap_id });
              break;
            case "collapse":
              collapseRootComment();
              break;
          }
        }}
      />
    </>
  );
}
