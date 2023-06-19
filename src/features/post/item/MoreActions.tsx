import {
  IonActionSheet,
  IonButton,
  IonIcon,
  useIonModal,
  useIonRouter,
  useIonToast,
} from "@ionic/react";
import {
  arrowDown,
  arrowUndoOutline,
  arrowUp,
  bookmarkOutline,
  ellipsisHorizontal,
  heart,
  heartDislike,
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

interface MoreActionsProps {
  post: PostView;
}

export default function MoreActions({ post }: MoreActionsProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const [present] = useIonToast();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const jwt = useAppSelector((state) => state.auth.jwt);

  const router = useIonRouter();

  const pageContext = useContext(PageContext);
  const [login, onDismiss] = useIonModal(Login, {
    onDismiss: (data: string, role: string) => onDismiss(data, role),
  });

  const postVotesById = useAppSelector((state) => state.post.postVotesById);

  const myVote = postVotesById[post.post.id] ?? post.my_vote;

  return (
    <>
      <IonIcon icon={ellipsisHorizontal} onClick={() => setOpen(true)} />

      <IonActionSheet
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
              // TODO
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
              // TODO
              break;
            }
          }

          //   if (e.detail.role === "subscribe") {
          //     if (!jwt) return login({ presentingElement: pageContext.page });

          //     try {
          //       // await dispatch(followCommunity(!isSubscribed, community));
          //     } catch (error) {
          //       present({
          //         message: `Problem ${
          //           isSubscribed ? "unsubscribing from" : "subscribing to"
          //         } c/${community}. Please try again.`,
          //         duration: 3500,
          //         position: "bottom",
          //         color: "danger",
          //       });
          //       throw error;
          //     }

          //     present({
          //       message: `${
          //         isSubscribed ? "Unsubscribed from" : "Subscribed to"
          //       } c/${community}.`,
          //       duration: 3500,
          //       position: "bottom",
          //       color: "success",
          //     });
          //   }
        }}
      />
    </>
  );
}
