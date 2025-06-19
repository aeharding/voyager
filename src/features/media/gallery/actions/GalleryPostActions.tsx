import { IonIcon } from "@ionic/react";
import { StashMedia } from "capacitor-stash-media";
import { chatbubbleOutline } from "ionicons/icons";
import React, { use } from "react";
import { Link } from "react-router-dom";
import { PostView } from "threadiverse";

import { InFeedContext } from "#/features/feed/Feed";
import MoreActions from "#/features/post/shared/MoreActions";
import { useShare } from "#/features/share/share";
import { getShareIcon, isNative } from "#/helpers/device";
import { getCounts } from "#/helpers/lemmyCompat";
import useAppToast from "#/helpers/useAppToast";
import { useOpenPostInSecondColumnIfNeededProps } from "#/routes/twoColumn/useOpenInSecondColumnIfNeededProps";

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
  const presentToast = useAppToast();
  const { close } = use(GalleryContext);
  const share = useShare();

  async function shareImage() {
    if (!isNative()) {
      share(src);
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

  const postProps = useOpenPostInSecondColumnIfNeededProps(
    post.post,
    post.community,
  );

  return (
    <BottomContainer>
      <AltText alt={alt} title={title} />
      {videoRef && <VideoActions videoRef={videoRef} />}
      <BottomContainerActions withBg>
        <div className={styles.container} onClick={(e) => e.stopPropagation()}>
          <Vote post={post} />
          <Link
            to={postProps.routerLink}
            onClick={(e) => {
              close();

              postProps.onClick(e);
            }}
          >
            <div className={styles.section}>
              <IonIcon icon={chatbubbleOutline} />
              <div className={styles.amount}>{getCounts(post).comments}</div>
            </div>
          </Link>
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
