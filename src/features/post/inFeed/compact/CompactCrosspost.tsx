import styled from "@emotion/styled";
import { IonIcon, IonSkeletonText } from "@ionic/react";
import { arrowUpSharp, chatbubbleOutline, repeat } from "ionicons/icons";
import { PostView } from "lemmy-js-client";
import { MouseEvent, useEffect } from "react";
import { css } from "@emotion/react";
import LinkInterceptor from "../../../shared/markdown/LinkInterceptor";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { setPostRead } from "../../postSlice";
import { resolveObject } from "../../../resolve/resolveSlice";
import { useAutohidePostIfNeeded } from "../../../feed/PageTypeContext";
import { formatNumber } from "../../../../helpers/number";

const Container = styled(LinkInterceptor)<{ isRead: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;

  max-width: 100%;

  border-radius: 0.5rem;
  overflow: hidden;

  color: inherit;
  text-decoration: none;
  -webkit-touch-callout: default;

  background: rgba(var(--ion-color-light-rgb), 0.5);
  padding: 3px 9px;

  font-size: 0.8em;

  color: var(--ion-color-text-aside);

  ${({ isRead }) =>
    isRead &&
    css`
      color: var(--read-color-medium);
    `}
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
`;

const CrosspostIcon = styled(IonIcon)`
  font-size: 1.5rem;
`;

const CommunityTitle = styled.div`
  min-width: 20px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CommunityIonSkeletonText = styled(IonSkeletonText)`
  width: 90px;
`;

const StatIonSkeletonText = styled(IonSkeletonText)`
  width: 16px;
`;

interface CrosspostProps {
  post: PostView;
  url: string;
  className?: string;
}

export default function CompactCrosspost({
  post,
  url,
  className,
}: CrosspostProps) {
  const dispatch = useAppDispatch();
  const autohidePostIfNeeded = useAutohidePostIfNeeded();

  const object = useAppSelector((state) => state.resolve.objectByUrl[url]);
  const crosspost = typeof object === "object" ? object.post : undefined;

  const hasBeenRead: boolean = useAppSelector((state) =>
    crosspost
      ? state.post.postReadById[crosspost.post.id] || crosspost.read
      : false,
  );

  useEffect(() => {
    if (object) return;

    let visible = true;

    setTimeout(() => {
      if (!visible) return;

      dispatch(resolveObject(url));
    }, 250);

    return () => {
      visible = false;
    };
  }, [url, dispatch, object]);

  const handleLinkClick = (e: MouseEvent) => {
    e.stopPropagation();

    if (crosspost) dispatch(setPostRead(crosspost.post.id));

    dispatch(setPostRead(post.post.id));
    autohidePostIfNeeded(post);
  };

  if (!post.post.url) return;

  return (
    <Container
      className={className}
      href={url}
      onClick={handleLinkClick}
      draggable="false"
      isRead={hasBeenRead}
    >
      <CrosspostIcon icon={repeat} />
      {crosspost ? (
        <CommunityTitle>{crosspost.community.title}</CommunityTitle>
      ) : (
        <CommunityIonSkeletonText />
      )}
      <Stat>
        <IonIcon icon={arrowUpSharp} />{" "}
        {crosspost ? (
          formatNumber(crosspost.counts.score)
        ) : (
          <StatIonSkeletonText />
        )}
      </Stat>
      <Stat>
        <IonIcon icon={chatbubbleOutline} />{" "}
        {crosspost ? (
          formatNumber(crosspost.counts.comments)
        ) : (
          <StatIonSkeletonText />
        )}
      </Stat>
    </Container>
  );
}
