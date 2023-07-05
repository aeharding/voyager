import {
  IonActionSheet,
  IonButton,
  useIonModal,
  useIonRouter,
  useIonToast,
} from "@ionic/react";
import {
  arrowDownOutline,
  arrowUndoOutline,
  arrowUpOutline,
  bookmarkOutline,
  ellipsisHorizontal,
  eyeOffOutline,
  eyeOutline,
  flagOutline,
  peopleOutline,
  personOutline,
  shareOutline,
  textOutline,
} from "ionicons/icons";
import { useContext, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { PostView } from "lemmy-js-client";
import {
  postHiddenByIdSelector,
  hidePost,
  unhidePost,
  voteOnPost,
  savePost,
} from "../postSlice";
import { getHandle } from "../../../helpers/lemmy";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import SelectText from "../../../pages/shared/SelectTextModal";
import { notEmpty } from "../../../helpers/array";
import { PageContext } from "../../auth/PageContext";
import { saveError, voteError } from "../../../helpers/toastMessages";
import { ActionButton } from "../actions/ActionButton";
import IonIconNoStroke from "../../../helpers/ionIconNoStroke";

interface MoreActionsProps {
  post: PostView;
  className?: string;
  onFeed?: boolean;
}

export default function MoreActions({
  post,
  className,
  onFeed,
}: MoreActionsProps) {
  const [present] = useIonToast();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const isHidden = useAppSelector(postHiddenByIdSelector)[post.post.id];

  const router = useIonRouter();

  const { page, presentLoginIfNeeded, presentCommentReply, presentReport } =
    useContext(PageContext);

  const [selectText, onDismissSelectText] = useIonModal(SelectText, {
    text: post.post.body,
    onDismiss: (data: string, role: string) => onDismissSelectText(data, role),
  });

  const postVotesById = useAppSelector((state) => state.post.postVotesById);
  const postSavedById = useAppSelector((state) => state.post.postSavedById);

  const myVote = postVotesById[post.post.id] ?? post.my_vote;
  const mySaved = postSavedById[post.post.id] ?? post.saved;

  const buttons = useMemo(
    () =>
      [
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
        onFeed
          ? {
              text: isHidden ? "Unhide" : "Hide",
              role: isHidden ? "unhide" : "hide",
              icon: isHidden ? eyeOutline : eyeOffOutline,
            }
          : undefined,
        {
          text: "Share",
          role: "share",
          icon: shareOutline,
        },
        {
          text: "Report",
          role: "report",
          icon: flagOutline,
        },
        {
          text: "Cancel",
          role: "cancel",
        },
      ].filter(notEmpty),
    [isHidden, myVote, mySaved, post.community, post.creator, onFeed]
  );

  const Button = onFeed ? ActionButton : IonButton;

  return (
    <>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <IonIconNoStroke className={className} icon={ellipsisHorizontal} />
      </Button>
      <IonActionSheet
        cssClass="left-align-buttons"
        isOpen={open}
        buttons={buttons}
        onWillDismiss={async (e) => {
          setOpen(false);

          switch (e.detail.role) {
            case "upvote": {
              if (presentLoginIfNeeded()) return;

              try {
                await dispatch(voteOnPost(post.post.id, myVote === 1 ? 0 : 1));
              } catch (error) {
                present(voteError);

                throw error;
              }
              break;
            }
            case "downvote": {
              if (presentLoginIfNeeded()) return;

              try {
                await dispatch(
                  voteOnPost(post.post.id, myVote === -1 ? 0 : -1)
                );
              } catch (error) {
                present(voteError);

                throw error;
              }
              break;
            }
            case "save": {
              if (presentLoginIfNeeded()) return;

              try {
                await dispatch(savePost(post.post.id, !mySaved));
              } catch (error) {
                present(saveError);

                throw error;
              }
              break;
            }
            case "reply": {
              if (presentLoginIfNeeded()) return;

              // Not viewing comments, so no feed update
              presentCommentReply(post);

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
              return selectText({ presentingElement: page });
            }
            case "hide": {
              if (presentLoginIfNeeded()) return;

              dispatch(hidePost(post.post.id));

              break;
            }
            case "unhide": {
              if (presentLoginIfNeeded()) return;

              dispatch(unhidePost(post.post.id));

              break;
            }
            case "share": {
              navigator.share({ url: post.post.url ?? post.post.ap_id });

              break;
            }
            case "report": {
              presentReport(post);
            }
          }
        }}
      />
    </>
  );
}
