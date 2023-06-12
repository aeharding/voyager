import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonPage,
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

const BorderlessIonItem = styled(IonItem)`
  --padding-start: 0;
  --inner-padding-end: 0;
`;

const Img = styled.img`
  width: 100%;
  max-height: 50vh;
  object-fit: contain;
  background: var(--lightroom-bg);
`;

const StyledMarkdown = styled(Markdown as any)`
  img {
    width: 100%;
    max-height: 50vh;
    object-fit: contain;
    object-position: 0%;
  }
`;

const StyledEmbed = styled(Embed)`
  margin: 1rem;
`;

const PostDeets = styled.div`
  margin: 0 1rem 1rem;
`;

const Title = styled.div`
  margin: 1rem 0;
`;

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
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

  function renderBody() {
    if (!post) return;

    if (
      post.post.url &&
      (post.post.url.endsWith(".jpeg") ||
        post.post.url.endsWith(".png") ||
        post.post.url.endsWith(".gif"))
    ) {
      return <Img src={post.post.url} />;
    }

    if (markdownLoneImage)
      return (
        <Img src={markdownLoneImage.url} alt={markdownLoneImage.altText} />
      );

    if (post.post.url) {
      return <StyledEmbed post={post} />;
    }
  }

  if (!post) return <CenteredSpinner />;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text={post.community.name} defaultHref="../" />
          </IonButtons>
          <IonTitle>{post?.counts.comments} Comments</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <BorderlessIonItem>
          <Container>
            {renderBody()}
            <PostDeets>
              <Title>{post.post.name}</Title>
              <Stats stats={post.counts} />
              {post.post.body && !markdownLoneImage && (
                <StyledMarkdown>{post.post.body}</StyledMarkdown>
              )}
            </PostDeets>
          </Container>
        </BorderlessIonItem>

        <BorderlessIonItem>
          <PostActions />
        </BorderlessIonItem>

        <Comments postId={post.post.id} />
      </IonContent>
    </IonPage>
  );
}
