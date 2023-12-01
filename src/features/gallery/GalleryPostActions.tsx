import { IonIcon } from "@ionic/react";
import { VoteButton } from "../post/shared/VoteButton";
import { PostView } from "lemmy-js-client";
import { chatbubbleOutline, shareOutline } from "ionicons/icons";
import styled from "@emotion/styled";
import { useAppSelector } from "../../store";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { getHandle } from "../../helpers/lemmy";
import MoreActions from "../post/shared/MoreActions";
import {
  calculateTotalScore,
  calculateSeparateScore,
} from "../../helpers/vote";
import { useLocation } from "react-router";
import React, { useContext } from "react";
import { GalleryContext } from "./GalleryProvider";
import { OVoteDisplayMode } from "../../services/db";
import { isNative } from "../../helpers/device";
import GalleryMoreActions from "./GalleryMoreActions";
import { StashMedia } from "capacitor-stash-media";
import { Share } from "@capacitor/share";
import useAppToast from "../../helpers/useAppToast";
import { useOptimizedIonRouter } from "../../helpers/useOptimizedIonRouter";

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
  imgSrc: string;
}

export default function GalleryPostActions({
  post,
  imgSrc,
}: GalleryPostActionsProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const link = buildGeneralBrowseLink(
    `/c/${getHandle(post.community)}/comments/${post.post.id}`,
  );
  const router = useOptimizedIonRouter();
  const location = useLocation();
  const presentToast = useAppToast();
  const { close } = useContext(GalleryContext);

  async function shareImage() {
    if (!isNative()) {
      Share.share({ url: imgSrc });
      return;
    }

    try {
      await StashMedia.shareImage({
        url: imgSrc,
        title: post.post.name,
      });
    } catch (error) {
      presentToast({
        message: "Error sharing photo",
        color: "danger",
        position: "top",
        fullscreen: true,
      });

      throw error;
    }
  }

  return (
    <Container onClick={(e) => e.stopPropagation()}>
      <Voting post={post} imgSrc={imgSrc} />
      <div
        onClick={() => {
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
      <IonIcon icon={shareOutline} onClick={shareImage} />
      {isNative() ? (
        <GalleryMoreActions post={post} imgSrc={imgSrc} />
      ) : (
        <MoreActions post={post} onFeed />
      )}
    </Container>
  );
}

function Voting({ post }: GalleryPostActionsProps): React.ReactElement {
  const postVotesById = useAppSelector((state) => state.post.postVotesById);

  const voteDisplayMode = useAppSelector(
    (state) => state.settings.appearance.voting.voteDisplayMode,
  );

  switch (voteDisplayMode) {
    case OVoteDisplayMode.Total: {
      const score = calculateTotalScore(post, postVotesById);

      return (
        <Section>
          <VoteButton type="up" postId={post.post.id} />
          <Amount>{score}</Amount>
          <VoteButton type="down" postId={post.post.id} />
        </Section>
      );
    }
    case OVoteDisplayMode.Separate: {
      const { upvotes, downvotes } = calculateSeparateScore(
        post,
        postVotesById,
      );

      return (
        <Section>
          <VoteButton type="up" postId={post.post.id} />
          <Amount>{upvotes}</Amount>
          <VoteButton type="down" postId={post.post.id} />
          <Amount>{downvotes}</Amount>
        </Section>
      );
    }
    case OVoteDisplayMode.Hide:
      return (
        <Section>
          <VoteButton type="up" postId={post.post.id} />
          <VoteButton type="down" postId={post.post.id} />
        </Section>
      );
  }
}
