import styled from "@emotion/styled";
import { IonItem, useIonModal, useIonToast } from "@ionic/react";
import { PostView } from "lemmy-js-client";
import { megaphone } from "ionicons/icons";
import PreviewStats from "./PreviewStats";
import Embed from "../shared/Embed";
import { useContext, useEffect, useMemo, useState } from "react";
import { css } from "@emotion/react";
import { findLoneImage } from "../../../helpers/markdown";
import { getHandle, isUrlImage } from "../../../helpers/lemmy";
import { useAppDispatch, useAppSelector } from "../../../store";
import { voteOnPost } from "../postSlice";
import { maxWidthCss } from "../../shared/AppContent";
import Login from "../../auth/Login";
import { PageContext } from "../../auth/PageContext";
import Nsfw, { isNsfw } from "../../labels/Nsfw";
import { VoteButton } from "../shared/VoteButton";
import DraggingVote from "../../shared/DraggingVote";
import { voteError } from "../../../helpers/toastMessages";
import MoreActions from "../shared/MoreActions";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import PersonLink from "../../labels/links/PersonLink";
import CommentReply from "../../comment/reply/CommentReply";
import InlineMarkdown from "../../shared/InlineMarkdown";
import { AnnouncementIcon } from "../detail/PostDetail";
import CommunityLink from "../../labels/links/CommunityLink";

const StyledDraggingVote = styled(DraggingVote)`
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

const CommunityName = styled.div`
  display: flex;
  align-items: center;

  > span {
    max-width: 14rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

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
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const [present] = useIonToast();
  const dispatch = useAppDispatch();

  const jwt = useAppSelector((state) => state.auth.jwt);
  const [login, onDismiss] = useIonModal(Login, {
    onDismiss: (data: string, role: string) => onDismiss(data, role),
  });
  const pageContext = useContext(PageContext);

  const [reply, onDismissReply] = useIonModal(CommentReply, {
    onDismiss: (data: string, role: string) => onDismissReply(data, role),
    post,
  });

  const markdownLoneImage = useMemo(
    () => (post.post.body ? findLoneImage(post.post.body) : undefined),
    [post]
  );
  const [blur, setBlur] = useState(isNsfw(post));
  const postVotesById = useAppSelector((state) => state.post.postVotesById);
  const currentVote =
    postVotesById[post.post.id] ?? (post.my_vote as 1 | -1 | 0 | undefined);

  useEffect(() => {
    setBlur(isNsfw(post));
  }, [post]);

  async function onVote(score: 1 | -1 | 0) {
    if (jwt) {
      try {
        await dispatch(voteOnPost(post.post.id, score));
      } catch (error) {
        present(voteError);
      }
    } else login({ presentingElement: pageContext.page });
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
            <InlineMarkdown>{post.post.body}</InlineMarkdown>
          </PostBody>
        </>
      );
    }

    if (post.post.url) {
      return <Embed post={post} />;
    }
  }

  return (
    <StyledDraggingVote
      currentVote={currentVote}
      onVote={onVote}
      onReply={() => {
        if (!jwt) return login({ presentingElement: pageContext.page });
        else reply({ presentingElement: pageContext.page });
      }}
    >
      {/* href=undefined: Prevent drag failure on firefox */}
      <CustomIonItem
        detail={false}
        routerLink={buildGeneralBrowseLink(
          `/c/${getHandle(post.community)}/comments/${post.post.id}`
        )}
        href={undefined}
        className={className}
      >
        <Container>
          <div>
            <InlineMarkdown>{post.post.name}</InlineMarkdown>{" "}
            {isNsfw(post) && <Nsfw />}
          </div>

          {renderPostBody()}

          <Details>
            <LeftDetails>
              {communityMode ? (
                <CommunityName>
                  {post.counts.featured_community ||
                  post.counts.featured_local ? (
                    <AnnouncementIcon icon={megaphone} />
                  ) : undefined}
                  <PersonLink
                    person={post.creator}
                    showInstanceWhenRemote
                    prefix="by"
                  />
                </CommunityName>
              ) : (
                <CommunityLink
                  community={post.community}
                  showInstanceWhenRemote
                />
              )}
              <PreviewStats
                stats={post.counts}
                voteFromServer={post.my_vote}
                published={post.post.published}
              />
            </LeftDetails>
            <RightDetails onClick={(e) => e.stopPropagation()}>
              <MoreActions post={post} />
              <VoteButton type="up" postId={post.post.id} />
              <VoteButton type="down" postId={post.post.id} />
            </RightDetails>
          </Details>
        </Container>
      </CustomIonItem>
    </StyledDraggingVote>
  );
}
