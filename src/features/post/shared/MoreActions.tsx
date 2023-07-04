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
  eyeOffOutline,
  eyeOutline,
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
} from "../postSlice";
import { getHandle } from "../../../helpers/lemmy";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import SelectText from "../../../pages/shared/SelectTextModal";
import { ActionButton } from "../actions/ActionButton";
import { css } from "@emotion/react";
import { notEmpty } from "../../../helpers/array";
import { PageContext } from "../../auth/PageContext";

interface MoreActionsProps {
  post: PostView;
  className?: string;
}

export default function MoreActions({ post, className }: MoreActionsProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const isHidden = useAppSelector(postHiddenByIdSelector)[post.post.id];

  const router = useIonRouter();

  const { page, presentLoginIfNeeded, presentCommentReply } =
    useContext(PageContext);

  const [selectText, onDismissSelectText] = useIonModal(SelectText, {
    text: post.post.body,
    onDismiss: (data: string, role: string) => onDismissSelectText(data, role),
  });

  const postVotesById = useAppSelector((state) => state.post.postVotesById);

  const myVote = postVotesById[post.post.id] ?? post.my_vote;

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
          text: isHidden ? "Unhide" : "Hide",
          role: isHidden ? "unhide" : "hide",
          icon: isHidden ? eyeOutline : eyeOffOutline,
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
      ].filter(notEmpty),
    [isHidden, myVote, post.community, post.creator]
  );

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
        buttons={buttons}
        onWillDismiss={async (e) => {
          setOpen(false);

          switch (e.detail.role) {
            case "upvote": {
              if (presentLoginIfNeeded()) return;

              dispatch(voteOnPost(post.post.id, myVote === 1 ? 0 : 1));
              break;
            }
            case "downvote": {
              if (presentLoginIfNeeded()) return;

              dispatch(voteOnPost(post.post.id, myVote === -1 ? 0 : -1));
              break;
            }
            case "save": {
              if (presentLoginIfNeeded()) return;
              // TODO
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
          }
        }}
      />
    </>
  );
}
