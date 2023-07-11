import { IonIcon, useIonRouter } from "@ionic/react";
import { VoteButton } from "../post/shared/VoteButton";
import { PostView } from "lemmy-js-client";
import { chatbubbleOutline, shareOutline } from "ionicons/icons";
import styled from "@emotion/styled";
import { useAppDispatch, useAppSelector } from "../../store";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { getHandle } from "../../helpers/lemmy";
import MoreActions from "../post/shared/MoreActions";
import { calculateCurrentVotesCount } from "../../helpers/vote";
import { useLocation } from "react-router";
import { useContext } from "react";
import { GalleryContext } from "./GalleryProvider";
import { setPostRead } from "../post/postSlice";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  font-size: 1.5em;

  max-width: 600px;
  margin: auto;
`;

const Section = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Amount = styled.div`
  font-size: 1rem;
`;

interface GalleryPostActionsProps {
  post: PostView;
}

export default function GalleryPostActions({ post }: GalleryPostActionsProps) {
  const postVotesById = useAppSelector((state) => state.post.postVotesById);
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const link = buildGeneralBrowseLink(
    `/c/${getHandle(post.community)}/comments/${post.post.id}`
  );
  const router = useIonRouter();
  const score = calculateCurrentVotesCount(post, postVotesById);
  const location = useLocation();
  const { close } = useContext(GalleryContext);
  const dispatch = useAppDispatch();

  function share() {
    navigator.share({ url: post.post.ap_id });
  }

  return (
    <Container onClick={(e) => e.stopPropagation()}>
      <Section>
        <VoteButton type="up" postId={post.post.id} />
        <Amount>{score}</Amount>
        <VoteButton type="down" postId={post.post.id} />
      </Section>
      <div
        onClick={() => {
          dispatch(setPostRead(post.post.id));
          close();

          if (location.pathname.startsWith(link)) return;

          setTimeout(() => router.push(link), 10);
        }}
      >
        <Section>
          <IonIcon icon={chatbubbleOutline} />
          <Amount>{post.counts.comments}</Amount>
        </Section>
      </div>
      <IonIcon icon={shareOutline} onClick={share} />
      <MoreActions post={post} onFeed />
    </Container>
  );
}
