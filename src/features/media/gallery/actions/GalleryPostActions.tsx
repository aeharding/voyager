import { IonIcon } from "@ionic/react";
import { StashMedia } from "capacitor-stash-media";
import { chatbubbleOutline } from "ionicons/icons";
import { PostView } from "lemmy-js-client";
import React, { use } from "react";
import { useLocation } from "react-router";

import { InFeedContext } from "#/features/feed/Feed";
import MoreActions from "#/features/post/shared/MoreActions";
import { buildPostLink } from "#/helpers/appLinkBuilder";
import { getShareIcon, isNative } from "#/helpers/device";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { shareUrl } from "#/helpers/share";
import useAppToast from "#/helpers/useAppToast";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";

import { GalleryContext } from "../GalleryProvider";
import AltText from "./AltText";
import GalleryActions from "./GalleryActions";
import { BottomContainer, BottomContainerActions } from "./shared";
import VideoActions from "./VideoActions";
import Vote from "./vote/Vote";

import styles from "./GalleryPostActions.module.css";

export interface GalleryPostActionsProps
  extends React.ComponentProps<typeof AltText> {
  post: PostView;
  src: string;
  alt?: string;
  videoRef?: React.RefObject<HTMLVideoElement | undefined>;
}

export default function GalleryPostActions({
  post,
  src,
  alt,
  videoRef,
  title,
}: GalleryPostActionsProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const router = useOptimizedIonRouter();
  const location = useLocation();
  const presentToast = useAppToast();
  const { close } = use(GalleryContext);

  async function shareImage() {
    if (!isNative()) {
      shareUrl(src);
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
      <AltText alt={alt} title={title} />
      {videoRef && <VideoActions videoRef={videoRef} />}
      <BottomContainerActions withBg>
        <div className={styles.container} onClick={(e) => e.stopPropagation()}>
          <Vote post={post} />
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
            <GalleryActions post={post} src={src} videoRef={videoRef} />
          ) : (
            <InFeedContext value={true}>
              <MoreActions post={post} />
            </InFeedContext>
          )}
        </div>
      </BottomContainerActions>
    </BottomContainer>
  );
}
