import { Share } from "@capacitor/share";
import { IonIcon, useIonActionSheet } from "@ionic/react";
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
import { useContext } from "react";

import { PageContext } from "#/features/auth/PageContext";
import { ActionButton } from "#/features/post/actions/ActionButton";
import { savePost } from "#/features/post/postSlice";
import useNativeBrowser from "#/features/shared/useNativeBrowser";
import { getShareIcon, isNative } from "#/helpers/device";
import { getHandle } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import {
  photoCopied,
  photoSaved,
  saveError,
  saveSuccess,
} from "#/helpers/toastMessages";
import useAppToast from "#/helpers/useAppToast";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import { useAppDispatch, useAppSelector } from "#/store";

interface GalleryActionsProps {
  post?: PostView;
  src: string;
  isVideo?: boolean;
}

export default function GalleryActions({
  post,
  src,
  isVideo,
}: GalleryActionsProps) {
  const router = useOptimizedIonRouter();
  const openNativeBrowser = useNativeBrowser();
  const [presentActionSheet] = useIonActionSheet();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  const { presentLoginIfNeeded } = useContext(PageContext);
  const presentToast = useAppToast();
  const dispatch = useAppDispatch();

  const postSavedById = useAppSelector((state) => state.post.postSavedById);

  function openActions() {
    const mySaved = post
      ? (postSavedById[post.post.id] ?? post.saved)
      : undefined;

    presentActionSheet({
      cssClass: "left-align-buttons",
      buttons: compact([
        isVideo
          ? {
              text: "Share Link",
              icon: getShareIcon(),
              handler: () => {
                Share.share({ url: post?.post.ap_id });
              },
            }
          : {
              text: "Share",
              icon: getShareIcon(),
              handler: () => {
                (async () => {
                  if (!isNative()) {
                    Share.share({ url: src });
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
        isVideo
          ? {
              text: "Save Video",
              icon: downloadOutline,
              handler: () => {
                (async () => {
                  try {
                    await StashMedia.saveVideo({ url: src });
                  } catch (error) {
                    presentToast({
                      message: "Error saving video to device",
                      color: "danger",
                      position: "top",
                      fullscreen: true,
                    });

                    throw error;
                  }

                  presentToast(photoSaved);
                })();
              },
            }
          : {
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
        !isVideo && {
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
        post && {
          text: "Open in Browser",
          icon: earthOutline,
          handler: () => {
            openNativeBrowser(post.post.ap_id);
          },
        },
        post && {
          text: "Save",
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
