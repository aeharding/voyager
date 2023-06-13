import styled from "@emotion/styled";
import { IonIcon, useIonModal } from "@ionic/react";
import {
  arrowDownSharp,
  arrowUndoOutline,
  arrowUpSharp,
  bookmarkOutline,
  bookmarkSharp,
  shareOutline,
} from "ionicons/icons";
import { useAppDispatch, useAppSelector } from "../store";
import { css } from "@emotion/react";
import { voteOnPost } from "../features/post/postSlice";
import { useContext } from "react";
import Login from "../features/auth/Login";
import { PageContext } from "../features/auth/PageContext";

const Container = styled.div`
  display: flex;
  justify-content: space-around;
  color: var(--ion-color-primary);
  font-size: 1.5em;

  width: 100%;
`;

const Item = styled.div<{ on?: boolean; onColor?: string }>`
  width: 2rem;
  height: 2rem;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 8px;

  ${({ on, onColor }) =>
    on &&
    css`
      background: ${onColor};
      color: var(--ion-color-primary-contrast);
    `}
`;

interface PostActionsProps {
  postId: number;
}

export default function PostActions({ postId }: PostActionsProps) {
  const dispatch = useAppDispatch();
  const postVotesById = useAppSelector((state) => state.post.postVotesById);
  const loggedIn = useAppSelector((state) => state.auth.jwt);
  const pageContext = useContext(PageContext);

  const myVote = postVotesById[postId];

  const [login, onDismiss] = useIonModal(Login, {
    onDismiss: (data: string, role: string) => onDismiss(data, role),
  });

  return (
    <Container>
      <Item
        on={myVote === 1}
        onClick={() => {
          if (!loggedIn) return login({ presentingElement: pageContext.page });

          dispatch(voteOnPost(postId, myVote === 1 ? 0 : 1));
        }}
        onColor="var(--ion-color-primary)"
      >
        <IonIcon icon={arrowUpSharp} />
      </Item>
      <Item
        on={myVote === -1}
        onClick={() => {
          if (!loggedIn) return login({ presentingElement: pageContext.page });

          dispatch(voteOnPost(postId, myVote === -1 ? 0 : -1));
        }}
        onColor="var(--ion-color-danger)"
      >
        <IonIcon icon={arrowDownSharp} />
      </Item>
      <Item>
        <IonIcon icon={bookmarkOutline} />
      </Item>
      <Item>
        <IonIcon icon={arrowUndoOutline} />
      </Item>
      <Item>
        <IonIcon icon={shareOutline} />
      </Item>
    </Container>
  );
}
