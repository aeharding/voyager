import styled from "@emotion/styled";
import {
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonRouterLink,
  ItemSlidingCustomEvent,
  useIonModal,
} from "@ionic/react";
import { PostView } from "lemmy-js-client";
import {
  arrowDownSharp,
  arrowUndo,
  arrowUpSharp,
  ellipsisHorizontal,
} from "ionicons/icons";
import PreviewStats from "./PreviewStats";
import Embed from "./Embed";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { css } from "@emotion/react";
import { findLoneImage } from "../helpers/markdown";
import { useParams } from "react-router";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { getHandle, getItemActorName, isUrlImage } from "../helpers/lemmy";
import { useAppDispatch, useAppSelector } from "../store";
import { voteOnPost } from "../features/post/postSlice";
import { maxWidthCss } from "./AppContent";
import Login from "../features/auth/Login";
import { PageContext } from "../features/auth/PageContext";
import Nsfw, { isNsfw } from "./Nsfw";
import { VoteButton } from "./VoteButton";

const StyledIonItemSliding = styled(IonItemSliding)`
  border-bottom: 8px solid var(--thick-separator-color);
`;

const CustomIonItem = styled(IonItem)`
  --padding-start: 0;
  --inner-padding-end: 0;

  --border-width: 0;
  --border-style: none;
  --background-hover: none;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.75rem;
  padding: 0.75rem;

  ${maxWidthCss}
`;

const Icon = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 10px;
`;

export const UpvoteArrow = styled(IonIcon)<{
  willUpvote: boolean;
  slash: boolean;
  bgColor: string;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  width: 80px;

  opacity: 0.5;

  ${({ willUpvote }) =>
    willUpvote &&
    css`
      opacity: 1;
    `}

  ${({ slash, bgColor }) =>
    slash &&
    css`
      &::after {
        content: "";
        position: absolute;
        height: 30px;
        width: 3px;
        background: white;
        font-size: 1.7em;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        transform-origin: center;
        box-shadow: 0 0 0 2px var(--ion-color-${bgColor});
      }
    `}
`;

const Details = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  font-size: 0.8em;
  color: var(--ion-color-medium);
`;

const LeftDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const RightDetails = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.5rem;

  > * {
    padding: 0.5rem;
  }
`;

const CommunityDetails = styled.div`
  display: flex;
  align-items: center;

  gap: 0.5rem;

  color: var(--ion-color-medium);
  text-decoration: none;
`;

const CommunityName = styled.div`
  max-width: 14rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  aside {
    display: inline;
    opacity: 0.7;
  }
`;

const PostBody = styled.div`
  font-size: 0.8em !important;
  line-height: 1.3;
  opacity: 0.5;

  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ImageContainer = styled.div`
  overflow: hidden;
  margin: 0 -1rem;
`;

const PostImage = styled.img<{ blur: boolean }>`
  width: calc(100%);
  max-width: none;

  ${({ blur }) =>
    blur &&
    css`
      filter: blur(40px);
    `}
`;

interface PostProps {
  post: PostView;

  /**
   * Hide the community name, show author name
   */
  communityMode?: boolean;

  className?: string;
}

export default function Post({ post, communityMode, className }: PostProps) {
  const dispatch = useAppDispatch();

  const jwt = useAppSelector((state) => state.auth.jwt);
  const [login, onDismiss] = useIonModal(Login, {
    onDismiss: (data: string, role: string) => onDismiss(data, role),
  });
  const pageContext = useContext(PageContext);

  const { actor } = useParams<{ actor: string }>();

  const dragRef = useRef<ItemSlidingCustomEvent | undefined>();
  const [ratio, setRatio] = useState(0);

  const markdownLoneImage = useMemo(
    () => (post.post.body ? findLoneImage(post.post.body) : undefined),
    [post]
  );
  const [blur, setBlur] = useState(isNsfw(post));
  const postVotesById = useAppSelector((state) => state.post.postVotesById);
  const currentVote = postVotesById[post.post.id];

  const [staleCurrentVote, setStaleCurrentVote] = useState(currentVote);

  useEffect(() => {
    setBlur(isNsfw(post));
  }, [post]);

  useEffect(() => {
    setStaleCurrentVote(currentVote);
  }, [ratio]);

  function vote(score: 1 | -1 | 0) {
    if (jwt) dispatch(voteOnPost(post.post.id, score));
    else login({ presentingElement: pageContext.page });
  }

  async function onVoteDragStop() {
    if (!dragRef.current) return;

    if (ratio <= -1.5) {
      vote(currentVote === -1 ? 0 : -1);
    } else if (ratio <= -1) {
      vote(currentVote === 1 ? 0 : 1);
    }

    dragRef.current.target.closeOpened();
  }

  function renderPostBody() {
    if (post.post.url && isUrlImage(post.post.url)) {
      return (
        <ImageContainer>
          <PostImage
            src={post.post.url}
            draggable="false"
            blur={blur}
            onClick={(e) => {
              if (isNsfw(post)) {
                e.stopPropagation();
                setBlur(!blur);
              }
            }}
          />
        </ImageContainer>
      );
    }

    if (markdownLoneImage)
      return (
        <ImageContainer>
          <PostImage
            src={markdownLoneImage.url}
            alt={markdownLoneImage.altText}
            blur={blur}
            onClick={(e) => {
              if (isNsfw(post)) {
                e.stopPropagation();
                setBlur(!blur);
              }
            }}
          />
        </ImageContainer>
      );

    if (post.post.thumbnail_url && post.post.url) {
      return <Embed post={post} />;
    }

    if (post.post.body) {
      return (
        <>
          {post.post.url && <Embed post={post} />}

          <PostBody>
            <ReactMarkdown
              skipHtml
              allowedElements={["p", "a", "li", "ul", "ol"]}
              components={{
                a: "span",
                p: "span",
                li: "span",
                ul: "span",
                ol: "span",
              }}
            >
              {post.post.body}
            </ReactMarkdown>
          </PostBody>
        </>
      );
    }

    if (post.post.url) {
      return <Embed post={post} />;
    }
  }

  return (
    <StyledIonItemSliding
      onIonDrag={async (e) => {
        dragRef.current = e;
        const ratio = await e.target.getSlidingRatio();
        if (Math.round(ratio) === ratio) return;
        setRatio(ratio);
      }}
      onTouchEnd={onVoteDragStop}
      onMouseUp={onVoteDragStop}
    >
      <IonItemOptions side="start">
        <IonItemOption color={ratio <= -1.5 ? "danger" : "primary"}>
          <UpvoteArrow
            slash={
              ratio <= -1.5 ? staleCurrentVote === -1 : staleCurrentVote === 1
            }
            willUpvote={ratio <= -1}
            icon={ratio <= -1.5 ? arrowDownSharp : arrowUpSharp}
            bgColor={ratio <= -1.5 ? "danger" : "primary"}
          />
        </IonItemOption>
      </IonItemOptions>

      {/* href=undefined: Prevent drag failure on firefox */}
      <CustomIonItem
        detail={false}
        routerLink={`/${actor}/c/${getHandle(post.community)}/comments/${
          post.post.id
        }`}
        href={undefined}
        className={className}
      >
        <Container>
          <div>
            {post.post.name} {isNsfw(post) && <Nsfw />}
          </div>

          {renderPostBody()}

          <Details>
            <LeftDetails>
              {communityMode ? (
                <CommunityDetails>
                  <CommunityName>
                    by {post.creator.name}
                    {!post.creator.local && (
                      <aside>@{getItemActorName(post.creator)}</aside>
                    )}
                  </CommunityName>
                </CommunityDetails>
              ) : (
                <IonRouterLink
                  routerLink={`/${actor}/c/${getHandle(post.community)}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <CommunityDetails>
                    {post.community.icon && (
                      <Icon src={post.community.icon} draggable="false" />
                    )}
                    <CommunityName>
                      {post.community.name}
                      {!post.community.local && (
                        <aside>@{getItemActorName(post.community)}</aside>
                      )}
                    </CommunityName>
                  </CommunityDetails>
                </IonRouterLink>
              )}
              <PreviewStats stats={post.counts} />
            </LeftDetails>
            <RightDetails onClick={(e) => e.stopPropagation()}>
              <VoteButton type="up" postId={post.post.id} />
              <VoteButton type="down" postId={post.post.id} />
              <IonIcon icon={ellipsisHorizontal} />
            </RightDetails>
          </Details>
        </Container>
      </CustomIonItem>

      <IonItemOptions side="end">
        <IonItemOption>
          <IonIcon icon={arrowUndo} />
        </IonItemOption>
      </IonItemOptions>
    </StyledIonItemSliding>
  );
}
