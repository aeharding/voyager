import {
  IonActionSheet,
  IonIcon,
  useIonModal,
  useIonRouter,
} from "@ionic/react";
import {
  arrowDown,
  arrowUndoOutline,
  arrowUp,
  bookmarkOutline,
  ellipsisHorizontal,
  peopleOutline,
  personOutline,
  shareOutline,
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

interface MoreActionsProps {
  post: PostView;
}

export default function MoreActions({ post }: MoreActionsProps) {
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

  const postVotesById = useAppSelector((state) => state.post.postVotesById);

  const myVote = postVotesById[post.post.id] ?? post.my_vote;

  return (
    <>
      <IonIcon icon={ellipsisHorizontal} onClick={() => setOpen(true)} />

      <IonActionSheet
        cssClass="left-align-buttons"
        isOpen={open}
        buttons={[
          {
            text: myVote !== 1 ? "Upvote" : "Undo Upvote",
            role: "upvote",
            icon: arrowUp,
          },
          {
            text: myVote !== -1 ? "Downvote" : "Undo Downvote",
            role: "downvote",
            icon: arrowDown,
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
