import styled from "@emotion/styled";
import {
  IonButtons,
  IonButton,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  useIonToast,
  IonText,
  IonSegment,
  IonSegmentButton,
  IonItem,
  IonList,
  IonInput,
  IonLabel,
  IonIcon,
  IonNavLink,
  useIonRouter,
} from "@ionic/react";
import { useEffect, useState } from "react";
import useClient from "../../../helpers/useClient";
import { useAppSelector } from "../../../store";
import { Centered, Spinner } from "../../auth/Login";
import { jwtSelector, urlSelector } from "../../auth/authSlice";
import { startCase } from "lodash";
import { css } from "@emotion/react";
import { getHandle, getRemoteHandle } from "../../../helpers/lemmy";
import { cameraOutline } from "ionicons/icons";
import { NewPostProps } from "./NewPost";
import NewPostText from "./NewPostText";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import PhotoPreview from "./PhotoPreview";
import { uploadImage } from "../../../services/lemmy";

const Container = styled.div`
  position: absolute;
  inset: 0;

  display: flex;
  flex-direction: column;
`;

const IonInputTitle = styled(IonInput)`
  .input-bottom {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 0;
    border: 0;
  }

  .native-wrapper {
    margin-right: 2rem;
  }
`;

const PostingIn = styled.div`
  font-size: 0.9em;
  margin: 0.5rem 0;
  text-align: center;
  color: var(--ion-color-medium);
`;

const CameraIcon = styled(IonIcon)`
  margin: -0.2em 0; // TODO negative margin, bad alex
  font-size: 1.5em;

  margin-right: 0.5rem;
`;

const HiddenInput = styled.input`
  display: none;
`;

type PostType = "photo" | "link" | "text";

export default function NewPostRoot({
  setCanDismiss,
  community,
  dismiss,
}: NewPostProps) {
  if (!community) throw new Error("community must be defined");

  const [postType, setPostType] = useState<PostType>("photo");
  const client = useClient();
  const jwt = useAppSelector(jwtSelector);
  const [present] = useIonToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");

  const [photoUrl, setPhotoUrl] = useState("");
  const [photoPreviewURL, setPhotoPreviewURL] = useState<string | undefined>(
    undefined
  );
  const [photoUploading, setPhotoUploading] = useState(false);

  const instanceUrl = useAppSelector(urlSelector);

  const router = useIonRouter();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  useEffect(() => {
    setCanDismiss(!text && !title && !url);
  }, [setCanDismiss, text, title, url]);

  function canSubmit() {
    if (!title) return false;

    switch (postType) {
      case "link":
        if (!url) return false;
        break;

      case "photo":
        if (!photoUrl) return false;
        break;
    }

    return true;
  }

  async function submit() {
    if (!jwt || !community) return;

    // super hacky, I know... but current value submitted
    // from child is needed for submit
    const text = await new Promise<string>((resolve) =>
      setText((text) => {
        resolve(text);
        return text;
      })
    );

    const postUrl = (() => {
      switch (postType) {
        case "link":
          return url || undefined;
        case "photo":
          return photoUrl || undefined;
        default:
          return;
      }
    })();

    let errorMessage: string | undefined;

    if (!title) {
      errorMessage = "Please add a title to your post.";
    } else if (postType === "link" && (!url || !validUrl(url))) {
      errorMessage =
        "Please add a valid URL to your post (start with https://).";
    } else if (postType === "photo" && !photoUrl) {
      errorMessage = "Please add a photo to your post.";
    } else if (!canSubmit()) {
      errorMessage =
        "It looks like you're missing some information to submit this post. Please double check.";
    }

    if (errorMessage) {
      present({
        // TODO more helpful msg
        message: errorMessage,
        duration: 3500,
        position: "bottom",
        color: "primary",
      });

      return;
    }

    setLoading(true);

    let postResponse;

    try {
      postResponse = await client.createPost({
        community_id: community.community_view.community.id,
        name: title,
        url: postUrl,
        body: text || undefined,

        auth: jwt,
      });
    } catch (error) {
      present({
        message: "Problem submitting your post. Please try again.",
        duration: 3500,
        position: "bottom",
        color: "danger",
      });

      throw error;
    } finally {
      setLoading(false);
    }

    present({
      message: "Post created!",
      duration: 3500,
      position: "bottom",
      color: "success",
    });

    setCanDismiss(true);
    setTimeout(() => dismiss(), 100);

    router.push(
      buildGeneralBrowseLink(
        `/c/${getHandle(community.community_view.community)}/comments/${
          postResponse.post_view.post.id
        }`
      )
    );
  }

  async function receivedImage(image: File) {
    if (!jwt) return;

    setPhotoPreviewURL(URL.createObjectURL(image));
    setPhotoUploading(true);

    let imageUrl;

    try {
      imageUrl = await uploadImage(instanceUrl, jwt, image);
    } catch (error) {
      present({
        message: "Problem uploading image. Please try again.",
        duration: 3500,
        position: "bottom",
        color: "danger",
      });
      clearImage();

      throw error;
    } finally {
      setPhotoUploading(false);
    }

    setPhotoUrl(imageUrl);
  }

  function clearImage() {
    setPhotoUrl("");
    setPhotoPreviewURL(undefined);
  }

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton color="medium" onClick={() => dismiss()}>
              Cancel
            </IonButton>
          </IonButtons>
          <IonTitle>
            <Centered>
              <IonText>{startCase(postType)} Post</IonText>
              {loading && <Spinner color="dark" />}
            </Centered>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              strong={true}
              type="submit"
              disabled={loading || !canSubmit()}
              onClick={submit}
            >
              Post
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSegment
            css={css`
              width: 100%;
            `}
            value={postType}
            onIonChange={(e) => setPostType(e.target.value as PostType)}
          >
            <IonSegmentButton value="photo">Photo</IonSegmentButton>
            <IonSegmentButton value="link">Link</IonSegmentButton>
            <IonSegmentButton value="text">Text</IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <Container>
          <IonList>
            <IonItem>
              <IonInputTitle
                value={title}
                onIonInput={(e) => setTitle(e.detail.value ?? "")}
                placeholder="Title"
                counter
                maxlength={200}
                counterFormatter={(inputLength, maxLength) =>
                  `${maxLength - inputLength}`
                }
              />
            </IonItem>
            {postType === "photo" && (
              <>
                <label htmlFor="photo-upload">
                  <IonItem>
                    <IonLabel color="primary">
                      <CameraIcon icon={cameraOutline} /> Choose Photo
                    </IonLabel>

                    <HiddenInput
                      type="file"
                      accept="image/jpeg, image/x-png, image/gif"
                      id="photo-upload"
                      onInput={(e) => {
                        const image = (e.target as HTMLInputElement).files?.[0];
                        if (!image) return;

                        receivedImage(image);
                      }}
                    />
                  </IonItem>
                </label>
                {photoPreviewURL && (
                  <IonItem>
                    <PhotoPreview
                      src={photoPreviewURL}
                      loading={photoUploading}
                    />
                  </IonItem>
                )}
              </>
            )}
            {postType === "link" && (
              <IonItem>
                <IonInput
                  placeholder="https://aspca.org"
                  clearInput
                  value={url}
                  onIonInput={(e) => setUrl(e.detail.value ?? "")}
                />
              </IonItem>
            )}
            <IonNavLink
              routerDirection="forward"
              component={() => (
                <NewPostText
                  value={text}
                  setValue={(value) => {
                    setText(value);
                  }}
                  onSubmit={submit}
                />
              )}
            >
              <IonItem detail>
                <IonLabel color={!text ? "medium" : undefined}>
                  {!text ? "Text (optional)" : text}
                </IonLabel>
              </IonItem>
            </IonNavLink>
          </IonList>

          <PostingIn>
            Posting in {getRemoteHandle(community.community_view.community)}
          </PostingIn>
        </Container>
      </IonContent>
    </>
  );
}

function validUrl(url: string): boolean {
  try {
    new URL(url);
  } catch (e) {
    return false;
  }

  return true;
}
