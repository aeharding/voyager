import styled from "@emotion/styled";
import { IonIcon, useIonToast } from "@ionic/react";
import { useContext } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { voteOnPost } from "../postSlice";
import { css } from "@emotion/react";
import { arrowDownSharp, arrowUpSharp } from "ionicons/icons";
import { ActionButton } from "../actions/ActionButton";
import { voteError } from "../../../helpers/toastMessages";
import { PageContext } from "../../auth/PageContext";

export const Item = styled(ActionButton, {
  shouldForwardProp: (prop) => prop !== "on" && prop !== "activeColor",
})<{
  on?: boolean;
  activeColor?: string;
}>`
  ${({ on, activeColor }) =>
    on
      ? css`
          background: ${activeColor};
          color: var(--ion-color-primary-contrast);
        `
      : undefined}
`;

interface VoteButtonProps {
  type: "down" | "up";
  postId: number;
}

export function VoteButton({ type, postId }: VoteButtonProps) {
  const [present] = useIonToast();
  const dispatch = useAppDispatch();
  const { presentLoginIfNeeded } = useContext(PageContext);

  const postVotesById = useAppSelector((state) => state.post.postVotesById);
  const myVote = postVotesById[postId];

  const icon = (() => {
    switch (type) {
      case "down":
        return arrowDownSharp;
      case "up":
        return arrowUpSharp;
    }
  })();

  const selectedVote = (() => {
    switch (type) {
      case "down":
        return -1;
      case "up":
        return 1;
    }
  })();

  const activeColor = (() => {
    switch (type) {
      case "down":
        return "var(--ion-color-danger)";
      case "up":
        return "var(--ion-color-primary)";
    }
  })();

  return (
    <Item
      on={myVote === selectedVote}
      onClick={async (e) => {
        e.stopPropagation();

        if (presentLoginIfNeeded()) return;

        try {
          await dispatch(
            voteOnPost(postId, myVote === selectedVote ? 0 : selectedVote)
          );
        } catch (error) {
          present(voteError);

          throw error;
        }
      }}
      activeColor={activeColor}
    >
      <IonIcon icon={icon} />
    </Item>
  );
}
