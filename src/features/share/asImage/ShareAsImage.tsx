import { IonButton, IonItem, IonLabel, IonList, IonToggle } from "@ionic/react";
import { CommentView } from "lemmy-js-client";
import { createContext, useEffect, useMemo, useState } from "react";
import { toBlob } from "@justfork/html-to-image";
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

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const PreviewWrapper = styled.div`
  overflow: hidden;
  margin: -16px 0;
  padding: 16px;
`;

const PreviewImgContainer = styled.div<{ height: number | undefined }>`
  height: min-content;

  display: flex;
  justify-content: center;
  align-items: center;

  ${({ height }) =>
    height &&
    css`
      height: ${height}px;
    `}
`;

const sharedImgCss = css`
  filter: var(--share-img-drop-shadow);

  .ios & {
    border-radius: 8px;
  }

  .md & {
    margin-top: 16px;
  }
`;

const PlaceholderImg = styled.div`
  height: 80px;
  width: 80%;
  margin: auto;
  background: var(--ion-item-background, var(--ion-background-color, #fff));

  ${sharedImgCss}
`;

const PreviewImg = styled.img`
  flex-shrink: 0;
  max-width: 100%;
  max-height: 100%;

  ${sharedImgCss}
`;

const ParentCommentValues = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const CommentSnapshotContainer = styled.div`
  background: var(--ion-item-background, var(--ion-background-color, #fff));
`;

const ShareIonButton = styled(IonButton)`
  margin: 0 16px
    max(var(--ion-safe-area-bottom, env(safe-area-inset-bottom, 0)), 16px);
`;

const shareAsImageRenderRoot = document.querySelector(
  "#share-as-image-root",
) as HTMLElement;

interface ShareAsImageProps {
  data: {
    comment: CommentView;
    comments: CommentView[];
  };
}

export default function ShareAsImage({ data }: ShareAsImageProps) {
  const presentToast = useAppToast();
  const [blob, setBlob] = useState<Blob | undefined>();
  const [greaterThanThreshold, setGreaterThanThreshold] = useState(false);
  const [minDepth, setMinDepth] = useState(
    getDepthFromComment(data.comment.comment) ?? 0,
  );
  const [hideUsernames, setHideUsernames] = useState(false);
  const [watermark, setWatermark] = useState(false);

  const [imageSrc, setImageSrc] = useState("");

  const maxImgHeight = (() => {
    if (document.body.clientHeight < 500) return 125;
    if (document.body.clientHeight < 600) return 200;
    if (document.body.clientHeight < 700) return 250;
    if (document.body.clientHeight < 750) return 275;

    return 400;
  })();

  useEffect(() => {
    if (!blob) return;

    (async () => {
      setImageSrc(await blobToDataURL(blob));
    })();
  }, [blob]);

  const filteredComments = useMemo(() => {
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
    () => buildCommentsTree(filteredComments, true),
    [filteredComments],
  );

  useEffect(() => {
    setTimeout(async () => {
      try {
        const blob = await toBlob(
          shareAsImageRenderRoot.querySelector(".inner") as HTMLElement,
          {
            pixelRatio: 4,
            includeStyleProperties,

            // TODO, for now ignore image/video to avoid tainted canvas failing render
            // (there's also display: none for img/video in index.css)
            //
            // Two ways around this in the future:
            //
            // 1. Use a centralized proxy for this
            // 2. Patch html-to-image to get image data using fetch API (native-only)
            filter: (node) => {
              if (node.tagName === "IMG") {
                if (node.classList.contains("allowed-image")) return true;

                return false;
              }

              return node.tagName !== "VIDEO";
            },
          },
        );
        setBlob(blob ?? undefined);
      } catch (error) {
        presentToast({
          message: "Error rendering image.",
        });

        throw error;
      }
    }, 200);
  }, [data, filteredComments, watermark, hideUsernames, presentToast]);

  async function onShare() {
    if (!blob) return;

    const filename = `${data.comment.comment.ap_id
      .replace(/^https:\/\//, "")
      .replaceAll(/\//g, "-")}.png`;

    const file = new File([blob], filename, {
      type: "image/png",
    });

    if (isNative()) {
      const data = await blobToString(blob);
      const file = await Filesystem.writeFile({
        data,
        directory: Directory.Cache,
        path: filename,
      });
      await Share.share({ files: [file.uri] });
      await Filesystem.deleteFile({ path: file.uri });
    } else if ("share" in navigator) {
      navigator.share({ files: [file] });
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
      <PreviewWrapper>
        <PreviewImgContainer
          className="embed"
          height={greaterThanThreshold ? maxImgHeight : undefined}
        >
          {!imageSrc ? (
            <PlaceholderImg />
          ) : (
            <PreviewImg
              src={imageSrc}
              onLoad={(e) => {
                if (!(e.target instanceof HTMLImageElement)) return;
                const parent = e.target.parentElement;
                if (!parent) return;

                setGreaterThanThreshold(
                  (e.target.naturalHeight / e.target.naturalWidth) *
                    parent.clientWidth >
                    maxImgHeight,
                );

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
        </PreviewImgContainer>
      </PreviewWrapper>

      <IonList inset lines="full">
        {!!getDepthFromComment(data.comment.comment) && (
          <IonItem>
            <IonLabel>Parent Comments</IonLabel>
            <ParentCommentValues slot="end">
              <strong>
                {(getDepthFromComment(data.comment.comment) ?? 0) - minDepth}
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
      <ShareIonButton onClick={onShare}>
        {isNative() || "share" in navigator ? "Share" : "Download"}
      </ShareIonButton>

      {createPortal(
        <CommentSnapshotContainer className="inner">
          <ShareImageContext.Provider value={{ hideUsernames }}>
            <CommentTree
              comment={commentNode[0]}
              first
              rootIndex={0}
              baseDepth={minDepth}
            />
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
});
