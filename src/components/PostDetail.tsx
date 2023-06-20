import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonRouterLink,
  IonSpinner,
  IonTitle,
  IonToolbar,
  useIonModal,
} from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../store";
import { useLocation, useParams } from "react-router";
import Stats from "./Stats";
import styled from "@emotion/styled";
import Embed from "./Embed";
import Comments from "./Comments";
import Markdown from "./Markdown";
import PostActions from "./PostActions";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { findLoneImage } from "../helpers/markdown";
import { getPost, receivedPosts } from "../features/post/postSlice";
import { getHandle, getItemActorName, isUrlImage } from "../helpers/lemmy";
import AppBackButton from "./AppBackButton";
import Img from "./Img";
import { Link } from "react-router-dom";
import { PageContext } from "../features/auth/PageContext";
import { maxWidthCss } from "./AppContent";
import { getClient } from "../services/lemmy";
import PersonLabel from "./PersonLabel";
import { PostView } from "lemmy-js-client";
import { useBuildGeneralBrowseLink } from "../helpers/routes";
import ViewAllComments from "./ViewAllComments";
import CommentReply from "../features/comment/CommentReply";
import Login from "../features/auth/Login";

const BorderlessIonItem = styled(IonItem)`
  --padding-start: 0;
  --inner-padding-end: 0;

  ${maxWidthCss}
`;

export const CenteredSpinner = styled(IonSpinner)`
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const Container = styled.div`
  margin: 0 0 1rem;
  width: 100%;
`;

const LightboxImg = styled(Img)`
  width: 100%;
  max-height: 50vh;
  object-fit: contain;
  background: var(--lightroom-bg);
`;

const StyledMarkdown = styled(Markdown as any)`
  img {
    display: block;
    max-width: 100%;
    max-height: 50vh;
    object-fit: contain;
    object-position: 0%;
  }
`;

const StyledEmbed = styled(Embed)`
  margin: 1rem 0;
`;

const PostDeets = styled.div`
  margin: 0 1rem;
  font-size: 0.9em;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-size: 1em;
  }
`;

const Title = styled.div`
  font-size: 1.3em;
  padding: 1rem 0 0;
  margin-bottom: 1rem;
`;

const By = styled.div`
  color: var(--ion-color-medium);
  margin: 0 0 0.5rem;

  strong,
  a {
    font-weight: 500;
    color: inherit;
    text-decoration: none;
  }
`;

const Aside = styled.div`
  display: inline;
  opacity: 0.7;
`;

export default function PostDetail() {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const { id, commentId, community } = useParams<{
    id: string;
    commentId?: string;
    community: string;
  }>();
  const jwt = useAppSelector((state) => state.auth.jwt);
  const [collapsed, setCollapsed] = useState(!!commentId);
  const post = useAppSelector((state) => state.post.postById[id]);
  const dispatch = useAppDispatch();
  const markdownLoneImage = useMemo(
    () => (post?.post.body ? findLoneImage(post.post.body) : undefined),
    [post]
  );
  const titleRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLElement | undefined>();
  const [commentsKey, setCommentsKey] = useState(Date.now());

  const [reply, onDismissReply] = useIonModal(CommentReply, {
    onDismiss: (data: string, role: string) => {
      if (role === "post") setCommentsKey(Date.now());
      onDismissReply(data, role);
    },
    post,
  });

  const [login, onDismissLogin] = useIonModal(Login, {
    onDismiss: (data: string, role: string) => onDismissLogin(data, role),
  });

  const pageContext = useContext(PageContext);

  useEffect(() => {
    if (post) return;

    dispatch(getPost(+id));
  }, [post]);

  useEffect(() => {
    dispatch(getPost(+id));
  }, [jwt]);

  useEffect(() => {
    titleRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [collapsed]);

  function renderImage() {
    if (!post) return;

    if (post.post.url && isUrlImage(post.post.url)) {
      return <LightboxImg src={post.post.url} />;
    }

    if (markdownLoneImage)
      return (
        <LightboxImg
          src={markdownLoneImage.url}
          alt={markdownLoneImage.altText}
        />
      );
  }

  function renderText() {
    if (!post) return;

    if (post.post.body && !markdownLoneImage) {
      return (
        <>
          {post.post.url && !isUrlImage(post.post.url) && <Embed post={post} />}
          <StyledMarkdown>{post.post.body}</StyledMarkdown>
        </>
      );
    }

    if (post.post.url && !isUrlImage(post.post.url)) {
      return <StyledEmbed post={post} />;
    }
  }

  function renderHeader(post: PostView) {
    return (
      <>
        <BorderlessIonItem
          onClick={(e) => {
            if (e.target instanceof HTMLElement && e.target.nodeName === "A")
              return;

            setCollapsed(!collapsed);
          }}
        >
          <Container>
            <div onClick={(e) => e.stopPropagation()}>{renderImage()}</div>
            <PostDeets>
              <Title ref={titleRef}>{post.post.name}</Title>
              {!collapsed && renderText()}
              <By>
                in{" "}
                <Link
                  to={buildGeneralBrowseLink(`/c/${getHandle(post.community)}`)}
                  onClick={(e) => e.stopPropagation()}
                >
                  {post.community.name}
                  {!post.community.local && (
                    <Aside>@{getItemActorName(post.community)}</Aside>
                  )}
                </Link>{" "}
                by <PersonLabel person={post.creator} />
              </By>
              <Stats
                stats={post.counts}
                voteFromServer={post.my_vote}
                published={post.post.published}
              />
            </PostDeets>
          </Container>
        </BorderlessIonItem>
        <BorderlessIonItem>
          <PostActions
            post={post}
            onReply={() => {
              if (!jwt) return login({ presentingElement: pageRef.current });
              else reply({ presentingElement: pageRef.current });
            }}
          />
        </BorderlessIonItem>
      </>
    );
  }

  return (
    <IonPage ref={pageRef}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <AppBackButton
              defaultHref={buildGeneralBrowseLink(`/c/${community}`)}
              defaultText={post?.community.name}
            />
          </IonButtons>
          <IonTitle>{post?.counts.comments} Comments</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <PageContext.Provider value={{ page: pageRef.current }}>
          {post ? (
            <Comments
              key={commentsKey}
              header={renderHeader(post)}
              postId={post.post.id}
              commentId={commentId ? +commentId : undefined}
              op={post.creator}
            />
          ) : (
            <CenteredSpinner />
          )}
        </PageContext.Provider>
        {commentId && <ViewAllComments />}
      </IonContent>
    </IonPage>
  );
}
