import { styled } from "@linaria/react";
import { PostView } from "lemmy-js-client";
import LargePost from "./large/LargePost";
import store, { useAppDispatch, useAppSelector } from "../../../store";
import CompactPost from "./compact/CompactPost";
import SlidingVote from "../../shared/sliding/SlidingPostVote";
import { IonItem } from "@ionic/react";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { getHandle } from "../../../helpers/lemmy";
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  experimental_useEffectEvent as useEffectEvent,
} from "react";
import { hidePost, unhidePost } from "../postSlice";
import AnimateHeight from "react-animate-height";
import { useAutohidePostIfNeeded } from "../../feed/PageTypeContext";
import { useLongPress } from "use-long-press";
import usePostActions from "../shared/usePostActions";
import { filterEvents } from "../../../helpers/longPress";
import {
  stopIonicTapClick,
  preventOnClickNavigationBug,
} from "../../../helpers/ionic";
import { cx } from "@linaria/core";
import { isTouchDevice } from "../../../helpers/device";
import { usePostAppearance } from "../appearance/PostAppearanceProvider";

const CustomIonItem = styled(IonItem)`
  --padding-start: 0;
  --inner-padding-end: 0;

  --border-width: 0;
  --border-style: none;
  --background-hover: none;
`;

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

  // eslint-disable-next-line react-compiler/react-compiler
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
        {/* href=undefined: Prevent drag failure on firefox */}
        <CustomIonItem
          mode="ios" // Use iOS style activatable tap highlight
          className={cx(isTouchDevice() && "ion-activatable")}
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
          href={undefined}
          ref={targetIntersectionRef}
          {...bind()}
        >
          {postBody}
        </CustomIonItem>
      </SlidingVote>
    </AnimateHeight>
  );
}

export default memo(Post);
