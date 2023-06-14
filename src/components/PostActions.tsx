import styled from "@emotion/styled";
import { IonIcon, useIonModal } from "@ionic/react";
import {
  arrowDownSharp,
  arrowUndoOutline,
  arrowUpSharp,
  bookmarkOutline,
  bookmarkSharp,
  linkOutline,
  shareOutline,
} from "ionicons/icons";
import { useAppDispatch, useAppSelector } from "../store";
import { css } from "@emotion/react";
import { voteOnPost } from "../features/post/postSlice";
import { useContext } from "react";
import Login from "../features/auth/Login";
import { PageContext } from "../features/auth/PageContext";
import { PostView } from "lemmy-js-client";

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
  post: PostView;
}

export default function PostActions({ post }: PostActionsProps) {
  const dispatch = useAppDispatch();
  const postVotesById = useAppSelector((state) => state.post.postVotesById);
  const jwt = useAppSelector((state) => state.auth.jwt);
  const pageContext = useContext(PageContext);

  const myVote = postVotesById[post.post.id];

  const [login, onDismiss] = useIonModal(Login, {
    onDismiss: (data: string, role: string) => onDismiss(data, role),
  });

  function share() {
    navigator.share({ url: post.post.ap_id });
  }

  return (
    <Container>
      <Item
        on={myVote === 1}
        onClick={() => {
          if (!jwt) return login({ presentingElement: pageContext.page });

          dispatch(voteOnPost(post.post.id, myVote === 1 ? 0 : 1));
        }}
        onColor="var(--ion-color-primary)"
      >
        <IonIcon icon={arrowUpSharp} />
      </Item>
      <Item
        on={myVote === -1}
        onClick={() => {
          if (!jwt) return login({ presentingElement: pageContext.page });

          dispatch(voteOnPost(post.post.id, myVote === -1 ? 0 : -1));
        }}
        onColor="var(--ion-color-danger)"
      >
        <IonIcon icon={arrowDownSharp} />
      </Item>
      <Item>
        <IonIcon icon={bookmarkOutline} />
      </Item>
      <Item>
        <a href={post.post.ap_id} target="_blank" rel="noopener noreferrer">
          <IonIcon icon={linkOutline} />
        </a>
      </Item>
      <Item>
        <IonIcon icon={arrowUndoOutline} />
      </Item>
      <Item>
        <IonIcon icon={shareOutline} onClick={share} />
      </Item>
    </Container>
  );
}
