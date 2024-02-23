import { styled } from "@linaria/react";
import { PostView } from "lemmy-js-client";
import LargePost from "./large/LargePost";
import store, { useAppDispatch, useAppSelector } from "../../../store";
import CompactPost from "./compact/CompactPost";
import SlidingVote from "../../shared/sliding/SlidingPostVote";
import { IonItem } from "@ionic/react";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { getHandle } from "../../../helpers/lemmy";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { hidePost, unhidePost } from "../postSlice";
import AnimateHeight from "react-animate-height";
import { useAutohidePostIfNeeded } from "../../feed/PageTypeContext";
import { useLongPress } from "use-long-press";
import usePostActions from "../shared/usePostActions";
import { filterSafariCallout } from "../../../helpers/longPress";
import { preventOnClickNavigationBug } from "../../../helpers/ionic";

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

  const onFinishHide = useCallback(() => {
    hideCompleteRef.current = true;

    const isHidden =
      store.getState().post.postHiddenById[props.post.post.id]?.hidden;

    if (isHidden) {
      dispatch(unhidePost(props.post.post.id));
    } else {
      dispatch(hidePost(props.post.post.id));
    }
  }, [dispatch, props.post.post.id]);

  useEffect(() => {
    // Refs must be used during cleanup useEffect
    shouldHideRef.current = shouldHide;
  }, [shouldHide]);

  useEffect(() => {
    return () => {
      if (!shouldHideRef.current) return;
      if (hideCompleteRef.current) return;

      onFinishHide();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const postAppearanceType = useAppSelector(
    (state) => state.settings.appearance.posts.type,
  );

  const onPostLongPress = useCallback(() => {
    openPostActions();
  }, [openPostActions]);

  const bind = useLongPress(onPostLongPress, {
    threshold: 800,
    cancelOnMovement: true,
    filterEvents: filterSafariCallout,
  });

  const postBody = (() => {
    switch (postAppearanceType) {
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
