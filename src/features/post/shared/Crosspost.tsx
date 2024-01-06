import styled from "@emotion/styled";
import { IonIcon, IonSkeletonText } from "@ionic/react";
import { arrowUpSharp, chatbubbleOutline, repeat } from "ionicons/icons";
import { PostView } from "lemmy-js-client";
import { MouseEvent, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import LinkInterceptor from "../../shared/markdown/LinkInterceptor";
import { useAutohidePostIfNeeded } from "../../feed/PageTypeContext";
import { setPostRead } from "../postSlice";
import { resolveObject } from "../../resolve/resolveSlice";
import LargePostContents from "../inFeed/large/LargePostContents";
import { formatNumber } from "../../../helpers/number";
import { css } from "@emotion/react";

const Container = styled(LinkInterceptor)`
  display: flex;
  flex-direction: column;
  gap: 8px;

  border-radius: 0.5rem;
  overflow: hidden;

  color: inherit;
  text-decoration: none;
  -webkit-touch-callout: default;

  background: rgba(var(--ion-color-light-rgb), 0.5);
  padding: 8px 12px;
`;

const Title = styled.div<{ isRead: boolean }>`
  font-size: 0.925em;

  ${({ isRead }) =>
    isRead &&
    css`
      color: var(--read-color);
    `}
`;

const Bottom = styled.div<{ isRead: boolean }>`
  display: flex;
  align-items: center;
  font-size: 0.8em;

  gap: 6px;

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

export default function Crosspost({ post, url, className }: CrosspostProps) {
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
      className={`cross-post ${className}`}
      href={url}
      el="div"
      onClick={handleLinkClick}
      draggable="false"
    >
      {crosspost ? (
        <Title isRead={hasBeenRead}>{crosspost.post.name}</Title>
      ) : (
        <IonSkeletonText />
      )}
      <LargePostContents post={crosspost ?? post} />
      <Bottom isRead={hasBeenRead}>
        <CrosspostIcon icon={repeat} />
        {crosspost ? crosspost.community.title : <CommunityIonSkeletonText />}
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
      </Bottom>
    </Container>
  );
}
