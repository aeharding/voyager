import { IonItem } from "@ionic/react";
import { PostView } from "lemmy-js-client";
import {
  memo,
  useCallback,
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
  useRef,
  useState,
} from "react";
import AnimateHeight from "react-animate-height";
import { useLongPress } from "use-long-press";

import { useAutohidePostIfNeeded } from "#/features/feed/PageTypeContext";
import { usePostAppearance } from "#/features/post/appearance/PostAppearanceProvider";
import usePostActions from "#/features/post/shared/usePostActions";
import SlidingVote from "#/features/shared/sliding/SlidingPostVote";
import { cx } from "#/helpers/css";
import { isTouchDevice } from "#/helpers/device";
import {
  preventOnClickNavigationBug,
  stopIonicTapClick,
} from "#/helpers/ionic";
import { getHandle } from "#/helpers/lemmy";
import { filterEvents } from "#/helpers/longPress";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import store, { useAppDispatch, useAppSelector } from "#/store";

import { hidePost, unhidePost } from "../postSlice";
import CompactPost from "./compact/CompactPost";
import LargePost from "./large/LargePost";

import styles from "./Post.module.css";

export interface PostProps {
  post: PostView;

  className?: string;
}

function Post(props: PostProps) {
  const dispatch = useAppDispatch();
  const autohidePostIfNeeded = useAutohidePostIfNeeded();
  const [shouldHide, setShouldHide] = useState(false);
  const shouldHideRef = useRef(false);
  const hideCompleteRef = useRef(false);
  const possiblyPost = useAppSelector(
    (state) => state.post.postById[props.post.post.id],
  );

  const potentialPost =
    typeof possiblyPost === "object" ? possiblyPost : undefined;
  const openPostActions = usePostActions(props.post);

  const targetIntersectionRef = useRef<HTMLIonItemElement>(null);

  const onFinishHide = () => {
    hideCompleteRef.current = true;

    const isHidden =
      store.getState().post.postHiddenById[props.post.post.id]?.hidden;

    if (isHidden) {
      dispatch(unhidePost(props.post.post.id));
    } else {
      dispatch(hidePost(props.post.post.id));
    }
  };

  const onFinishHideEvent = useEffectEvent(onFinishHide);

  useEffect(() => {
    return () => {
      if (!shouldHideRef.current) return;
      if (hideCompleteRef.current) return;

      onFinishHideEvent();
    };
  }, []);

  useEffect(() => {
    // Refs must be used during cleanup useEffect
    shouldHideRef.current = shouldHide;
  }, [shouldHide]);

  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  const postAppearance = usePostAppearance();

  const onPostLongPress = useCallback(() => {
    openPostActions();
    stopIonicTapClick();
  }, [openPostActions]);

  const bind = useLongPress(onPostLongPress, {
    threshold: 800,
    cancelOnMovement: 15,
    filterEvents,
  });

  const postBody = (() => {
    switch (postAppearance) {
      case "large":
        return <LargePost {...props} post={potentialPost ?? props.post} />;
      case "compact":
        return <CompactPost {...props} post={potentialPost ?? props.post} />;
    }
  })();

  return (
    <AnimateHeight
      duration={200}
      height={shouldHide ? 1 : "auto"}
      onHeightAnimationEnd={onFinishHide}
    >
      <SlidingVote
        item={props.post}
        className={props.className}
        onHide={() => setShouldHide(true)}
      >
        <IonItem
          mode="ios" // Use iOS style activatable tap highlight
          className={cx(styles.item, isTouchDevice() && "ion-activatable")}
          detail={false}
          routerLink={buildGeneralBrowseLink(
            `/c/${getHandle(props.post.community)}/comments/${
              props.post.post.id
            }`,
          )}
          onClick={(e) => {
            if (preventOnClickNavigationBug(e)) return;

            // Marking post read is done in the post detail page when it finishes transitioning in.
            // However, autohiding is context-sensitive (community feed vs special feed, etc)
            // and doesn't cause rerender, so do it now.
            autohidePostIfNeeded(props.post);
          }}
          // href=undefined: Prevent drag failure on firefox
          href={undefined}
          ref={targetIntersectionRef}
          {...bind()}
        >
          {postBody}
        </IonItem>
      </SlidingVote>
    </AnimateHeight>
  );
}

export default memo(Post);
