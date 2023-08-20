import {
  IonIcon,
  useIonActionSheet,
  useIonRouter,
  useIonToast,
} from "@ionic/react";
import {
  bookmarkOutline,
  copyOutline,
  downloadOutline,
  earthOutline,
  ellipsisHorizontal,
  peopleOutline,
  personOutline,
  shareOutline,
} from "ionicons/icons";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { getHandle } from "../../helpers/lemmy";
import { PostView } from "lemmy-js-client";
import { PageContext } from "../auth/PageContext";
import { useContext } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { savePost } from "../post/postSlice";
import { saveError } from "../../helpers/toastMessages";
import { Browser } from "@capacitor/browser";
import { ActionButton } from "../post/actions/ActionButton";
import { StashMedia } from "capacitor-stash-media";
import { isNative } from "../../helpers/device";
import { Share } from "@capacitor/share";

interface GalleryMoreActionsProps {
  post: PostView;
  imgSrc: string;
}

export default function GalleryMoreActions({
  post,
  imgSrc,
}: GalleryMoreActionsProps) {
  const router = useIonRouter();
  const [presentActionSheet] = useIonActionSheet();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  const { presentLoginIfNeeded } = useContext(PageContext);
  const [presentToast] = useIonToast();
  const dispatch = useAppDispatch();

  const postSavedById = useAppSelector((state) => state.post.postSavedById);
  const mySaved = postSavedById[post.post.id] ?? post.saved;

  function openActions() {
    presentActionSheet({
      cssClass: "left-align-buttons",
      buttons: [
        {
          text: "Share",
          icon: shareOutline,
          handler: () => {
            (async () => {
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
                  duration: 3500,
                  position: "bottom",
                  color: "danger",
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
                await StashMedia.savePhoto({ url: imgSrc });
              } catch (error) {
                presentToast({
                  message: "Error saving photo to device",
                  duration: 3500,
                  position: "bottom",
                  color: "danger",
                });

                throw error;
              }

              presentToast({
                message: "Photo saved",
                duration: 3500,
                position: "bottom",
                color: "success",
              });
            })();
          },
        },
        {
          text: "Copy Image",
          icon: copyOutline,
          handler: () => {
            (async () => {
              try {
                await StashMedia.copyPhotoToClipboard({ url: imgSrc });
              } catch (error) {
                presentToast({
                  message: "Error copying photo to clipboard",
                  duration: 3500,
                  position: "bottom",
                  color: "danger",
                });

                throw error;
              }

              presentToast({
                message: "Photo copied to clipboard",
                duration: 3500,
                position: "bottom",
                color: "success",
              });
            })();
          },
        },
        {
          text: "Open in Browser",
          icon: earthOutline,
          handler: () => {
            Browser.open({ url: post.post.ap_id });
          },
        },
        {
          text: "Save",
          icon: bookmarkOutline,
          handler: () => {
            (async () => {
              if (presentLoginIfNeeded()) return;

              try {
                await dispatch(savePost(post.post.id, !mySaved));
              } catch (error) {
                presentToast(saveError);

                throw error;
              }
            })();
          },
        },
        {
          text: getHandle(post.creator),
          icon: personOutline,
          handler: () => {
            router.push(
              buildGeneralBrowseLink(`/u/${getHandle(post.creator)}`),
            );
          },
        },
        {
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
      ],
    });
  }

  return (
    <ActionButton onClick={openActions}>
      <IonIcon icon={ellipsisHorizontal} />
    </ActionButton>
  );
}
