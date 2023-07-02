import {
  IonActionSheet,
  IonIcon,
  useIonModal,
  useIonRouter,
} from "@ionic/react";
import {
  arrowDownOutline,
  arrowUndoOutline,
  arrowUpOutline,
  bookmarkOutline,
  ellipsisHorizontal,
  peopleOutline,
  personOutline,
  shareOutline,
  textOutline,
} from "ionicons/icons";
import { useContext, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { PageContext } from "../../auth/PageContext";
import Login from "../../auth/Login";
import { PostView } from "lemmy-js-client";
import { voteOnPost } from "../postSlice";
import { getHandle } from "../../../helpers/lemmy";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import CommentReply from "../../comment/reply/CommentReply";
import { jwtSelector } from "../../auth/authSlice";
import SelectText from "../../../pages/shared/SelectTextModal";
import { ActionButton } from "../actions/ActionButton";
import { css } from "@emotion/react";

interface MoreActionsProps {
  post: PostView;
  className?: string;
}

export default function MoreActions({ post, className }: MoreActionsProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const jwt = useAppSelector(jwtSelector);

  const router = useIonRouter();

  const pageContext = useContext(PageContext);
  const [login, onDismiss] = useIonModal(Login, {
    onDismiss: (data: string, role: string) => onDismiss(data, role),
  });

  const [reply, onDismissReply] = useIonModal(CommentReply, {
    onDismiss: (data: string, role: string) => onDismissReply(data, role),
    item: post,
  });

  const [selectText, onDismissSelectText] = useIonModal(SelectText, {
    text: post.post.body,
    onDismiss: (data: string, role: string) => onDismissSelectText(data, role),
  });

  const postVotesById = useAppSelector((state) => state.post.postVotesById);

  const myVote = postVotesById[post.post.id] ?? post.my_vote;

  return (
    <>
      <ActionButton
        css={css`
          margin-right: 3px;
        `}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <IonIcon className={className} icon={ellipsisHorizontal} />
      </ActionButton>
      <IonActionSheet
        cssClass="left-align-buttons"
        isOpen={open}
        onClick={(e) => e.stopPropagation()}
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
            text: "Save",
            role: "save",
            icon: bookmarkOutline,
          },
          {
            text: "Reply",
            role: "reply",
            icon: arrowUndoOutline,
          },
          {
            text: getHandle(post.creator),
            role: "person",
            icon: personOutline,
          },
          {
            text: getHandle(post.community),
            role: "community",
            icon: peopleOutline,
          },
          {
            text: "Select Text",
            role: "select",
            icon: textOutline,
          },
          {
            text: "Share",
            role: "share",
            icon: shareOutline,
          },
          {
            text: "Cancel",
            role: "cancel",
          },
        ]}
        onWillDismiss={async (e) => {
          setOpen(false);

          switch (e.detail.role) {
            case "upvote": {
              if (!jwt) return login({ presentingElement: pageContext.page });

              dispatch(voteOnPost(post.post.id, myVote === 1 ? 0 : 1));
              break;
            }
            case "downvote": {
              if (!jwt) return login({ presentingElement: pageContext.page });

              dispatch(voteOnPost(post.post.id, myVote === -1 ? 0 : -1));
              break;
            }
            case "save": {
              if (!jwt) return login({ presentingElement: pageContext.page });
              // TODO
              break;
            }
            case "reply": {
              if (!jwt) return login({ presentingElement: pageContext.page });

              reply({ presentingElement: pageContext.page });

              break;
            }
            case "person": {
              router.push(
                buildGeneralBrowseLink(`/u/${getHandle(post.creator)}`)
              );

              break;
            }
            case "community": {
              router.push(
                buildGeneralBrowseLink(`/c/${getHandle(post.community)}`)
              );

              break;
            }
            case "select": {
              return selectText({ presentingElement: pageContext.page });
            }
            case "share": {
              navigator.share({ url: post.post.url ?? post.post.ap_id });

              break;
            }
          }
        }}
      />
    </>
  );
}
