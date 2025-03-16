import { CapacitorHttp } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { IonButton, IonItem, IonLabel, IonList, IonToggle } from "@ionic/react";
import { domToBlob, Options as DomToBlobOptions } from "modern-screenshot";
import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";

import CommentTree from "#/features/comment/inTree/CommentTree";
import PostHeader from "#/features/post/detail/PostHeader";
import { blobToDataURL, blobToString } from "#/helpers/blob";
import { cx } from "#/helpers/css";
import { isNative } from "#/helpers/device";
import { buildCommentsTree, getDepthFromComment } from "#/helpers/lemmy";
import useAppToast from "#/helpers/useAppToast";
import { getImageSrc } from "#/services/lemmy";
import { getServerUrl } from "#/services/nativeFetch";

import AddRemoveButtons from "./AddRemoveButtons";
import includeStyleProperties from "./includeStyleProperties";
import { ShareAsImageData } from "./ShareAsImageModal";
import Watermark from "./Watermark";

import styles from "./ShareAsImage.module.css";

const domToBlobOptions: DomToBlobOptions = {
  scale: 4,
  features: {
    // Without this, render fails on certain images
    removeControlCharacter: false,
  },
  includeStyleProperties,
  filter: (node) => {
    if (!(node instanceof HTMLElement)) return true;

    return node.tagName !== "VIDEO";
  },
  fetchFn: isNative()
    ? async (url) => {
        // Pass through relative URLs to browser fetching
        // !: running in native environment
        if (url.startsWith(`${getServerUrl!()}/`)) {
          return false;
        }

        // Attempt upgrade to https (insecure will be blocked)
        if (url.startsWith("http://")) {
          url = url.replace(/^http:\/\//, "https://");
        }

        const nativeResponse = await CapacitorHttp.get({
          // if pictrs, convert large gifs to jpg
          url: getImageSrc(url, { format: "jpg" }),
          responseType: "blob",
        });

        // Workaround that will probably break in a future capacitor upgrade
        // https://github.com/ionic-team/capacitor/issues/6126
        return `data:${
          nativeResponse.headers["Content-Type"] || "image/png"
        };base64,${nativeResponse.data}`;
      }
    : undefined,
};

const shareAsImageRenderRoot = document.querySelector(
  "#share-as-image-root",
) as HTMLElement;

interface ShareAsImageProps {
  data: ShareAsImageData;
  header: ReactNode;
}

export default function ShareAsImage({ data, header }: ShareAsImageProps) {
  const presentToast = useAppToast();

  const [hideUsernames, setHideUsernames] = useState(false);
  const [hideCommunity, setHideCommunity] = useState(false);
  const [includePostDetails, setIncludePostDetails] = useState(
    !("comment" in data),
  );
  const [includePostText, setIncludePostText] = useState(true);
  const [watermark, setWatermark] = useState(false);

  const [blob, setBlob] = useState<Blob | undefined>();
  const [imageSrc, setImageSrc] = useState("");

  const [minDepth, setMinDepth] = useState(
    ("comment" in data
      ? getDepthFromComment(data.comment.comment)
      : undefined) ?? 0,
  );

  const hasPostBody = data.post.post.body || data.post.post.url;

  useEffect(() => {
    if (!blob) return;

    (async () => {
      setImageSrc(await blobToDataURL(blob));
    })();
  }, [blob]);

  const filteredComments = (() => {
    if (!("comment" in data)) return [];

    const filtered = data.comments
      .filter(
        (c) =>
          (getDepthFromComment(c.comment) ?? 0) >= minDepth &&
          data.comment.comment.path.split(".").includes(`${c.comment.id}`),
      )
      .sort(
        (a, b) =>
          (getDepthFromComment(a.comment) ?? 0) -
          (getDepthFromComment(b.comment) ?? 0),
      );

    return filtered;
  })();

  const commentNode = filteredComments.length
    ? buildCommentsTree(filteredComments, true)
    : [];

  const render = useCallback(async () => {
    try {
      const blob = await domToBlob(
        shareAsImageRenderRoot.querySelector(".inner") as HTMLElement,
        domToBlobOptions,
      );
      setBlob(() => blob ?? undefined);
    } catch (error) {
      presentToast({
        message: "Error rendering image",
      });

      throw error;
    }
  }, [presentToast]);

  useLayoutEffect(() => {
    requestAnimationFrame(() => {
      render();
    });
  }, [
    render,
    data,
    filteredComments,
    watermark,
    hideUsernames,
    hideCommunity,
    includePostDetails,
    includePostText,
  ]);

  async function onShare() {
    if (!blob) return;

    const apId =
      "comment" in data ? data.comment.comment.ap_id : data.post.post.ap_id;

    const filename = `${apId
      .replace(/^https:\/\//, "")
      .replaceAll(/\//g, "-")}.png`;

    const file = new File([blob], filename, {
      type: "image/png",
    });

    const webSharePayload: ShareData = { files: [file] };

    if (isNative()) {
      const data = await blobToString(blob);
      const file = await Filesystem.writeFile({
        data,
        directory: Directory.Cache,
        path: filename,
      });
      await Share.share({ files: [file.uri] });
      await Filesystem.deleteFile({ path: file.uri });
    } else if ("canShare" in navigator && navigator.canShare(webSharePayload)) {
      navigator.share(webSharePayload);
    } else {
      const link = document.createElement("a");
      link.download = filename;
      link.href = URL.createObjectURL(file);
      link.click();
      URL.revokeObjectURL(link.href);
    }
  }

  return (
    <div className={styles.container}>
      {header}
      {!imageSrc ? (
        <div className={styles.placeholderImg} />
      ) : (
        <img
          className={styles.previewImg}
          draggable={false}
          src={imageSrc}
          onLoad={(e) => {
            if (!(e.target instanceof HTMLImageElement)) return;
            const parent = e.target.parentElement;
            if (!parent) return;

            // Safari hacks 😢 to force rerender
            const theMostParentedOfThemAll = parent.parentElement;
            if (!theMostParentedOfThemAll) return;
            setTimeout(() => {
              theMostParentedOfThemAll.style.opacity = "0.99";
              setTimeout(() => {
                theMostParentedOfThemAll.style.opacity = "1";
              });
            });
          }}
        />
      )}

      <IonList className={styles.list} inset lines="full">
        {"comment" in data && (
          <>
            <IonItem>
              <IonToggle
                checked={includePostDetails}
                onIonChange={(e) => setIncludePostDetails(e.detail.checked)}
              >
                Include Post Details
              </IonToggle>
            </IonItem>
            {includePostDetails && hasPostBody ? (
              <IonItem>
                <IonToggle
                  checked={includePostText}
                  onIonChange={(e) => setIncludePostText(e.detail.checked)}
                >
                  Include Post Text
                </IonToggle>
              </IonItem>
            ) : undefined}

            {!!getDepthFromComment(data.comment.comment) && (
              <IonItem>
                <IonLabel>Parent Comments</IonLabel>
                <div className={styles.parentCommentValues} slot="end">
                  <strong>
                    {(getDepthFromComment(data.comment.comment) ?? 0) -
                      minDepth}
                  </strong>
                  <AddRemoveButtons
                    addDisabled={minDepth === 0}
                    removeDisabled={
                      minDepth === getDepthFromComment(data.comment.comment)
                    }
                    onAdd={() => setMinDepth((minDepth) => minDepth - 1)}
                    onRemove={() => setMinDepth((minDepth) => minDepth + 1)}
                  />
                </div>
              </IonItem>
            )}
          </>
        )}
        {includePostDetails && (
          <IonItem>
            <IonToggle
              checked={hideCommunity}
              onIonChange={(e) => setHideCommunity(e.detail.checked)}
            >
              Hide Community
            </IonToggle>
          </IonItem>
        )}
        <IonItem>
          <IonToggle
            checked={hideUsernames}
            onIonChange={(e) => setHideUsernames(e.detail.checked)}
          >
            Hide Usernames
          </IonToggle>
        </IonItem>
        <IonItem lines="none">
          <IonToggle
            checked={watermark}
            onIonChange={(e) => setWatermark(e.detail.checked)}
          >
            Watermark
          </IonToggle>
        </IonItem>
      </IonList>
      <IonButton onClick={onShare}>
        {isNative() || "canShare" in navigator ? "Share" : "Download"}
      </IonButton>

      {createPortal(
        <div className={cx(styles.commentSnapshotContainer, "inner")}>
          <ShareImageContext
            value={{ capturing: true, hideUsernames, hideCommunity }}
          >
            {includePostDetails && (
              <PostHeader
                className={!("comment" in data) ? styles.hideBottomBorder : ""}
                post={data.post}
                showPostText={includePostText}
                showPostActions={false}
                constrainHeight={false}
              />
            )}
            {"comment" in data && (
              <>
                {includePostDetails && (
                  <div className={styles.postCommentSpacer} />
                )}
                <CommentTree
                  comment={commentNode[0]!}
                  first
                  rootIndex={0}
                  baseDepth={minDepth}
                />
              </>
            )}
          </ShareImageContext>
          {watermark && <Watermark />}
        </div>,
        shareAsImageRenderRoot,
      )}
    </div>
  );
}

export const ShareImageContext = createContext({
  /**
   * `true` when components are being rendered for image capture
   */
  capturing: false,
  hideUsernames: false,
  hideCommunity: false,
});
