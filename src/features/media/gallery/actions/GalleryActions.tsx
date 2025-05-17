import { ActionSheetButton, IonIcon, useIonActionSheet } from "@ionic/react";
import { StashMedia } from "capacitor-stash-media";
import { compact } from "es-toolkit";
import {
  bookmarkOutline,
  copyOutline,
  downloadOutline,
  earthOutline,
  ellipsisHorizontal,
  peopleOutline,
  personOutline,
} from "ionicons/icons";
import { PostView } from "lemmy-js-client";
import { use } from "react";

import { SharedDialogContext } from "#/features/auth/SharedDialogContext";
import { airplay, pip } from "#/features/icons";
import { ActionButton } from "#/features/post/actions/ActionButton";
import { savePost } from "#/features/post/postSlice";
import useNativeBrowser from "#/features/shared/useNativeBrowser";
import { getShareIcon, isNative, ua } from "#/helpers/device";
import { getHandle } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { useShare } from "#/features/share/share";
import {
  photoCopied,
  photoSaved,
  saveError,
  saveSuccess,
  videoSaved,
} from "#/helpers/toastMessages";
import { getVideoSrcForUrl } from "#/helpers/url";
import useAppToast from "#/helpers/useAppToast";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import { useAppDispatch, useAppSelector } from "#/store";

import { GalleryContext } from "../GalleryProvider";

interface GalleryActionsProps {
  post?: PostView;
  src: string;
  videoRef?: React.RefObject<HTMLVideoElement | undefined>;
}

export default function GalleryActions({
  post,
  src,
  videoRef,
}: GalleryActionsProps) {
  const { close } = use(GalleryContext);
  const router = useOptimizedIonRouter();
  const openNativeBrowser = useNativeBrowser();
  const [presentActionSheet] = useIonActionSheet();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  const { presentLoginIfNeeded } = use(SharedDialogContext);
  const presentToast = useAppToast();
  const dispatch = useAppDispatch();

  const postSavedById = useAppSelector((state) => state.post.postSavedById);

  const share = useShare();

  function openActions() {
    const mySaved = post
      ? (postSavedById[post.post.id] ?? post.saved)
      : undefined;

    const mediaActions: ActionSheetButton[] = compact(
      videoRef
        ? [
            {
              text: "Share Link",
              icon: getShareIcon(),
              handler: () => {
                share(post!.post.ap_id);
              },
            },
            {
              text: "Save Video",
              icon: downloadOutline,
              handler: () => {
                (async () => {
                  try {
                    await StashMedia.saveVideo({ url: getVideoSrcForUrl(src) });
                  } catch (error) {
                    presentToast({
                      message: "Error downloading video",
                      color: "danger",
                      position: "top",
                      fullscreen: true,
                    });

                    throw error;
                  }

                  presentToast(videoSaved);
                })();
              },
            },
            document.pictureInPictureEnabled && {
              text: "Picture in Picture",
              icon: pip,
              handler: () => {
                (async () => {
                  if (!videoRef.current) return;

                  await videoRef.current.requestPictureInPicture();
                  close();
                })();
              },
            },
            ua.getEngine().name === "WebKit" && {
              text: "Airplay",
              icon: airplay,
              handler: () => {
                (async () => {
                  if (!videoRef.current) return;

                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (videoRef.current as any).webkitShowPlaybackTargetPicker();
                })();
              },
            },
          ]
        : [
            {
              text: "Share",
              icon: getShareIcon(),
              handler: () => {
                (async () => {
                  if (!isNative()) {
                    share(src);
                    return;
                  }

                  try {
                    await StashMedia.shareImage({
                      url: src,
                      title: post ? post.post.name : "Image",
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
                })();
              },
            },
            {
              text: "Save Image",
              icon: downloadOutline,
              handler: () => {
                (async () => {
                  try {
                    await StashMedia.savePhoto({ url: src });
                  } catch (error) {
                    presentToast({
                      message: "Error saving photo to device",
                      color: "danger",
                      position: "top",
                      fullscreen: true,
                    });

                    throw error;
                  }

                  presentToast(photoSaved);
                })();
              },
            },
            {
              text: "Copy Image",
              icon: copyOutline,
              handler: () => {
                (async () => {
                  try {
                    await StashMedia.copyPhotoToClipboard({ url: src });
                  } catch (error) {
                    presentToast({
                      message: "Error copying photo to clipboard",
                      color: "danger",
                      position: "top",
                      fullscreen: true,
                    });

                    throw error;
                  }

                  presentToast(photoCopied);
                })();
              },
            },
          ],
    );

    presentActionSheet({
      cssClass: "left-align-buttons",
      buttons: compact([
        ...mediaActions,
        post && {
          text: "Open in Browser",
          icon: earthOutline,
          handler: () => {
            openNativeBrowser(post.post.ap_id);
          },
        },
        post && {
          text: !mySaved ? "Save" : "Unsave",
          icon: bookmarkOutline,
          handler: () => {
            (async () => {
              if (presentLoginIfNeeded()) return;

              try {
                await dispatch(savePost(post, !mySaved));

                if (!mySaved) presentToast(saveSuccess);
              } catch (error) {
                presentToast(saveError);

                throw error;
              }
            })();
          },
        },
        post && {
          text: getHandle(post.creator),
          icon: personOutline,
          handler: () => {
            router.push(
              buildGeneralBrowseLink(`/u/${getHandle(post.creator)}`),
            );
          },
        },
        post && {
          text: getHandle(post.community),
          icon: peopleOutline,
          handler: () => {
            router.push(
              buildGeneralBrowseLink(`/c/${getHandle(post.community)}`),
            );
          },
        },
        {
          text: "Cancel",
          role: "cancel",
        },
      ]),
    });
  }

  return (
    <ActionButton onClick={openActions}>
      <IonIcon icon={ellipsisHorizontal} />
    </ActionButton>
  );
}
