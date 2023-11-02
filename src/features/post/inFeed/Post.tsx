import { PostView } from "lemmy-js-client";
import LargePost from "./large/LargePost";
import { useAppDispatch, useAppSelector } from "../../../store";
import CompactPost from "./compact/CompactPost";
import SlidingVote from "../../shared/sliding/SlidingPostVote";
import { IonItem } from "@ionic/react";
import styled from "@emotion/styled";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { getHandle } from "../../../helpers/lemmy";
import { useCallback, useEffect, useRef, useState } from "react";
import { hidePost, unhidePost } from "../postSlice";
import AnimateHeight from "react-animate-height";

const CustomIonItem = styled(IonItem)`
  --padding-start: 0;
  --inner-padding-end: 0;

  --border-width: 0;
  --border-style: none;
  --background-hover: none;
`;

export interface PostProps {
  post: PostView;

  /**
   * Hide the community name, show author name
   */
  communityMode?: boolean;

  className?: string;
}

export default function Post(props: PostProps) {
  const dispatch = useAppDispatch();
  const [shouldHide, setShouldHide] = useState(false);
  const shouldHideRef = useRef(false);
  const isHidden = useAppSelector(
    (state) => state.post.postHiddenById[props.post.post.id]?.hidden,
  );
  const hideCompleteRef = useRef(false);
  const postById = useAppSelector((state) => state.post.postById);
  const possiblyPost = postById[props.post.post.id];
  const potentialPost =
    typeof possiblyPost === "object" ? possiblyPost : undefined;

  // eslint-disable-next-line no-undef
  const targetIntersectionRef = useRef<HTMLIonItemElement>(null);

  const onFinishHide = useCallback(() => {
    hideCompleteRef.current = true;

    if (isHidden) {
      dispatch(unhidePost(props.post.post.id));
    } else {
      dispatch(hidePost(props.post.post.id));
    }
  }, [dispatch, props.post.post.id, isHidden]);

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
          href={undefined}
          ref={targetIntersectionRef}
        >
          {postBody}
        </CustomIonItem>
      </SlidingVote>
    </AnimateHeight>
  );
}
