import { IonButton, IonItem, IonLabel, IonList, IonToggle } from "@ionic/react";
import { createContext, ReactNode, useState } from "react";
import { createPortal } from "react-dom";

import CommentTree from "#/features/comment/inTree/CommentTree";
import PostHeader from "#/features/post/detail/PostHeader";
import useCrosspostUrl from "#/features/post/shared/useCrosspostUrl";
import { cx } from "#/helpers/css";
import { isNative } from "#/helpers/device";
import { buildCommentsTree, getDepthFromComment } from "#/helpers/lemmy";
import { useAppSelector } from "#/store";

import AddRemoveButtons from "./AddRemoveButtons";
import PostContentSelector, { PostContent } from "./PostContentSelector";
import { ShareAsImageData } from "./ShareAsImageModal";
import useShareImage from "./useShareImage";
import Watermark from "./Watermark";

import styles from "./ShareAsImage.module.css";

interface ShareAsImageProps {
  data: ShareAsImageData;
  header: ReactNode;
}

export default function ShareAsImage({ data, header }: ShareAsImageProps) {
  const [hideUsernames, setHideUsernames] = useState(false);
  const [hideCommunity, setHideCommunity] = useState(false);
  const [includePost, setIncludePost] = useState(!("comment" in data));
  const [watermark, setWatermark] = useState(false);

  const collapsedBodyFromStore = useAppSelector(
    (state) => !!state.post.postCollapsedById[data.post.post.id],
  );
  const [postContent, setPostContent] = useState<PostContent>(() => {
    if ("comment" in data) return "full";
    return collapsedBodyFromStore ? "hide-body" : "full";
  });

  const [minDepth, setMinDepth] = useState(
    ("comment" in data
      ? getDepthFromComment(data.comment.comment)
      : undefined) ?? 0,
  );

  const hasPostBody = data.post.post.body || data.post.post.url;

  const crosspostUrl = useCrosspostUrl(data.post);

  const canHideBody =
    !!data.post.post.body?.trim() && !!data.post.post.url && !crosspostUrl;

  const filteredComments = (() => {
    if (!("comment" in data)) return [];

    return data.comments
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
  })();

  const commentNode = filteredComments.length
    ? buildCommentsTree(filteredComments, true)
    : [];

  const { imageSrc, renderRoot, onShare } = useShareImage({
    data,
    renderDeps: [
      data,
      filteredComments,
      watermark,
      hideUsernames,
      hideCommunity,
      includePost,
      postContent,
    ],
  });

  const shouldHide = ((): "body" | "except-title" | undefined => {
    if (postContent === "hide-body") return "body";
    if (postContent === "title-only") return "except-title";
  })();

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
                checked={includePost}
                onIonChange={(e) => setIncludePost(e.detail.checked)}
              >
                Include Post
              </IonToggle>
            </IonItem>
            {includePost && hasPostBody ? (
              <PostContentSelector
                value={postContent}
                onChange={setPostContent}
                canHideBody={canHideBody}
              />
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
        {!("comment" in data) && canHideBody ? (
          <IonItem>
            <IonToggle
              checked={postContent === "hide-body"}
              onIonChange={(e) =>
                setPostContent(e.detail.checked ? "hide-body" : "full")
              }
            >
              Hide Post Body
            </IonToggle>
          </IonItem>
        ) : undefined}
        {includePost && (
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
            {includePost && (
              <PostHeader
                className={!("comment" in data) ? styles.hideBottomBorder : ""}
                post={data.post}
                shouldHide={shouldHide}
                showPostActions={false}
                constrainHeight={false}
                collapsed={false}
              />
            )}
            {"comment" in data && (
              <>
                {includePost && <div className={styles.postCommentSpacer} />}
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
        renderRoot,
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
