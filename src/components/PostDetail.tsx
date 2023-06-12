import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonItem,
  IonPage,
  IonRouterLink,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../store";
import { useParams } from "react-router";
import Stats from "./Stats";
import styled from "@emotion/styled";
import Embed from "./Embed";
import Comments from "./Comments";
import Markdown from "./Markdown";
import PostActions from "./PostActions";
import { useEffect, useMemo } from "react";
import { findLoneImage } from "../helpers/markdown";
import { client } from "../services/lemmy";
import { receivedPosts } from "../features/post/postSlice";
import { isUrlImage } from "../helpers/lemmy";
import AppContent from "./AppContent";
import AppBackButton from "./AppBackButton";
import Img from "./Img";
import { Link } from "react-router-dom";

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

const BorderlessIonItem = styled(IonItem)`
  --padding-start: 0;
  --inner-padding-end: 0;
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
  margin: 1rem;
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
  margin: 1rem 0;
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

export default function PostDetail() {
  const { id, actor } = useParams<{ id: string; actor: string }>();
  const post = useAppSelector((state) => state.post.postById[id]);
  const dispatch = useAppDispatch();
  const markdownLoneImage = useMemo(
    () => (post?.post.body ? findLoneImage(post.post.body) : undefined),
    [post]
  );

  useEffect(() => {
    if (post) return;

    (async () => {
      const result = await client.getPost({ id: +id });

      dispatch(receivedPosts([result.post_view]));
    })();
  }, [post]);

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

    if (post.post.url && post.post.thumbnail_url)
      return <StyledEmbed post={post} />;
  }

  function renderText() {
    if (!post) return;

    if (post.post.body && !markdownLoneImage) {
      return (
        <>
          {post.post.url &&
            !post.post.thumbnail_url &&
            !isUrlImage(post.post.url) && <StyledEmbed post={post} />}
          <StyledMarkdown>{post.post.body}</StyledMarkdown>
        </>
      );
    }

    if (post.post.url && !isUrlImage(post.post.url)) {
      return <StyledEmbed post={post} />;
    }
  }

  if (!post) return <CenteredSpinner />;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <AppBackButton
              defaultHref="../"
              defaultText={post.community.name}
            />
          </IonButtons>
          <IonTitle>{post?.counts.comments} Comments</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent>
        <BorderlessIonItem>
          <Container>
            {renderImage()}
            <PostDeets>
              <Title>{post.post.name}</Title>
              {renderText()}
              <By>
                in{" "}
                <Link to={`/${actor}/c/${post.community.name}`}>
                  {post.community.name}
                </Link>{" "}
                by <strong>{post.creator.name}</strong>
              </By>
              <Stats stats={post.counts} />
            </PostDeets>
          </Container>
        </BorderlessIonItem>

        <BorderlessIonItem>
          <PostActions />
        </BorderlessIonItem>

        <Comments postId={post.post.id} />
      </AppContent>
    </IonPage>
  );
}
