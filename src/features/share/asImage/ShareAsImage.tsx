import { IonButton, IonItem, IonLabel, IonList, IonToggle } from "@ionic/react";
import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";
import CommentTree from "../../comment/CommentTree";
import { buildCommentsTree, getDepthFromComment } from "../../../helpers/lemmy";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import AddRemoveButtons from "./AddRemoveButtons";
import Watermark from "./Watermark";
import { isNative } from "../../../helpers/device";
import { Share } from "@capacitor/share";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { blobToDataURL, blobToString } from "../../../helpers/blob";
import useAppToast from "../../../helpers/useAppToast";
import includeStyleProperties from "./includeStyleProperties";
import { CapacitorHttp } from "@capacitor/core";
import { domToBlob } from "modern-screenshot";
import { getImageSrc } from "../../../services/lemmy";
import { ShareAsImageData } from "./ShareAsImageModal";
import PostHeader from "../../post/detail/PostHeader";
import { webviewServerUrl } from "../../../services/nativeFetch";

const Container = styled.div`
  --bottom-padding: max(
    var(--ion-safe-area-bottom, env(safe-area-inset-bottom, 0)),
    16px
  );

  --top-space: 50px;

  @media (max-height: 650px) {
    --top-space: 0px;
  }

  display: grid;
  grid-template-rows: max-content 1fr max-content;

  max-height: calc(
    100vh - var(--ion-safe-area-top, env(safe-area-inset-top, 0)) - var(
        --top-space
      )
  );

  padding: 0 16px var(--bottom-padding);
`;

const sharedImgCss = css`
  min-height: 0;
  max-height: 100%;
  justify-self: center;
  max-width: 100%;

  filter: var(--share-img-drop-shadow);

  .ios & {
    border-radius: 8px;
  }

  .md & {
    margin-top: 16px;
  }
`;

const PlaceholderImg = styled.div`
  ${sharedImgCss}

  background: ${({ theme }) => (theme.dark ? "black" : "white")};

  height: 80px;
  width: 80%;
`;

const PreviewImg = styled.img`
  ${sharedImgCss}
`;

const StyledIonList = styled(IonList)`
  &.list-ios.list-inset {
    margin-inline-start: 0;
    margin-inline-end: 0;
  }
`;

const ParentCommentValues = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const CommentSnapshotContainer = styled.div`
  background: var(--ion-item-background, var(--ion-background-color, #fff));
`;

const PostCommentSpacer = styled.div`
  height: 6px;
`;

const StyledPostHeader = styled(PostHeader)<{ hideBottomBorder: boolean }>`
  ${({ hideBottomBorder }) =>
    hideBottomBorder &&
    css`
      --inner-border-width: 0 0 0 0;
    `}
`;

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

  useEffect(() => {
    if (!blob) return;

    (async () => {
      setImageSrc(await blobToDataURL(blob));
    })();
  }, [blob]);

  const filteredComments = useMemo(() => {
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
  }, [data, minDepth]);

  const commentNode = useMemo(
    () =>
      filteredComments.length ? buildCommentsTree(filteredComments, true) : [],
    [filteredComments],
  );

  const render = useCallback(async () => {
    try {
      const blob = await domToBlob(
        shareAsImageRenderRoot.querySelector(".inner") as HTMLElement,
        {
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
                if (url.startsWith(`${webviewServerUrl}/`)) {
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
        },
      );
      setBlob(blob ?? undefined);
    } catch (error) {
      presentToast({
        message: "Error rendering image.",
      });

      throw error;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <Container>
      {header}
      {!imageSrc ? (
        <PlaceholderImg />
      ) : (
        <PreviewImg
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

      <StyledIonList inset lines="full">
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
            {includePostDetails && (
              <IonItem>
                <IonToggle
                  checked={includePostText}
                  onIonChange={(e) => setIncludePostText(e.detail.checked)}
                >
                  Include Post Text
                </IonToggle>
              </IonItem>
            )}

            {!!getDepthFromComment(data.comment.comment) && (
              <IonItem>
                <IonLabel>Parent Comments</IonLabel>
                <ParentCommentValues slot="end">
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
                </ParentCommentValues>
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
      </StyledIonList>
      <IonButton onClick={onShare}>
        {isNative() || "canShare" in navigator ? "Share" : "Download"}
      </IonButton>

      {createPortal(
        <CommentSnapshotContainer className="inner">
          <ShareImageContext.Provider value={{ hideUsernames, hideCommunity }}>
            {includePostDetails && (
              <StyledPostHeader
                hideBottomBorder={!("comment" in data)}
                post={data.post}
                showPostText={includePostText}
                showPostActions={false}
                constrainHeight={false}
              />
            )}
            {"comment" in data && (
              <>
                {includePostDetails && <PostCommentSpacer />}
                <CommentTree
                  comment={commentNode[0]!}
                  first
                  rootIndex={0}
                  baseDepth={minDepth}
                />
              </>
            )}
          </ShareImageContext.Provider>
          {watermark && <Watermark />}
        </CommentSnapshotContainer>,
        shareAsImageRenderRoot,
      )}
    </Container>
  );
}

export const ShareImageContext = createContext({
  hideUsernames: false,
  hideCommunity: false,
});
