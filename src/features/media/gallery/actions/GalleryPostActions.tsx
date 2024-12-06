import { Share } from "@capacitor/share";
import { IonIcon } from "@ionic/react";
import { StashMedia } from "capacitor-stash-media";
import { chatbubbleOutline } from "ionicons/icons";
import { PostView } from "lemmy-js-client";
import React, { useContext } from "react";
import { useLocation } from "react-router";

import { InFeedContext } from "#/features/feed/Feed";
import MoreActions from "#/features/post/shared/MoreActions";
import { VoteButton } from "#/features/post/shared/VoteButton";
import { buildPostLink } from "#/helpers/appLinkBuilder";
import { getShareIcon, isNative } from "#/helpers/device";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import useAppToast from "#/helpers/useAppToast";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import { calculateSeparateScore, calculateTotalScore } from "#/helpers/vote";
import { OVoteDisplayMode } from "#/services/db";
import { useAppSelector } from "#/store";

import { GalleryContext } from "../GalleryProvider";
import AltText from "./AltText";
import GalleryActions from "./GalleryActions";
import { BottomContainer, BottomContainerActions } from "./shared";
import VideoActions from "./VideoActions";

import styles from "./GalleryPostActions.module.css";

interface GalleryPostActionsProps {
  post: PostView;
  src: string;
  alt?: string;
  isVideo?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

export default function GalleryPostActions({
  post,
  src,
  alt,
  isVideo,
  videoRef,
}: GalleryPostActionsProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const router = useOptimizedIonRouter();
  const location = useLocation();
  const presentToast = useAppToast();
  const { close } = useContext(GalleryContext);

  async function shareImage() {
    if (!isNative()) {
      Share.share({ url: src });
      return;
    }

    try {
      await StashMedia.shareImage({
        url: src,
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
    <BottomContainer>
      <AltText alt={alt} />
      {isVideo && videoRef && <VideoActions videoRef={videoRef} />}
      <BottomContainerActions withBg>
        <div className={styles.container} onClick={(e) => e.stopPropagation()}>
          <Voting post={post} src={src} />
          <div
            onClick={() => {
              close();

              const link = buildGeneralBrowseLink(
                buildPostLink(post.community, post.post),
              );

              if (!location.pathname.startsWith(link)) router.push(link);
            }}
          >
            <div className={styles.section}>
              <IonIcon icon={chatbubbleOutline} />
              <div className={styles.amount}>{post.counts.comments}</div>
            </div>
          </div>
          <IonIcon icon={getShareIcon()} onClick={shareImage} />
          {isNative() ? (
            <GalleryActions post={post} src={src} isVideo={isVideo} />
          ) : (
            <InFeedContext.Provider value={true}>
              <MoreActions post={post} />
            </InFeedContext.Provider>
          )}
        </div>
      </BottomContainerActions>
    </BottomContainer>
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
        <div className={styles.section}>
          <VoteButton type="up" post={post} />
          <div className={styles.amount}>{score}</div>
          <VoteButton type="down" post={post} />
        </div>
      );
    }
    case OVoteDisplayMode.Separate: {
      const { upvotes, downvotes } = calculateSeparateScore(
        post,
        postVotesById,
      );

      return (
        <div className={styles.section}>
          <VoteButton type="up" post={post} />
          <div className={styles.amount}>{upvotes}</div>
          <VoteButton type="down" post={post} />
          <div className={styles.amount}>{downvotes}</div>
        </div>
      );
    }
    case OVoteDisplayMode.Hide:
      return (
        <div className={styles.section}>
          <VoteButton type="up" post={post} />
          <VoteButton type="down" post={post} />
        </div>
      );
  }
}
