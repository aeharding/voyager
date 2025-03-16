import {
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNavLink,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonText,
  IonTitle,
  IonToggle,
  IonToolbar,
  useIonAlert,
} from "@ionic/react";
import { startCase } from "es-toolkit";
import { accessibility, cameraOutline } from "ionicons/icons";
import { Post } from "lemmy-js-client";
import { useEffect, useMemo, useState } from "react";

import AppHeader from "#/features/shared/AppHeader";
import {
  deletePendingImageUploads,
  uploadImage,
} from "#/features/shared/markdown/editing/uploadImageSlice";
import { buildPostLink } from "#/helpers/appLinkBuilder";
import { isAndroid } from "#/helpers/device";
import { getRemoteHandle } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import {
  buildPostCreated,
  postEdited,
  problemFetchingTitle,
} from "#/helpers/toastMessages";
import { isUrlImage, isValidUrl } from "#/helpers/url";
import useAppToast from "#/helpers/useAppToast";
import useClient from "#/helpers/useClient";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import { useAppDispatch } from "#/store";

import { receivedPosts } from "../postSlice";
import NewPostText from "./NewPostText";
import PhotoPreview from "./PhotoPreview";
import { PostEditorProps } from "./PostEditor";

import styles from "./PostEditorRoot.module.css";

type PostType = "photo" | "link" | "text";

const MAX_TITLE_LENGTH = 200;

export default function PostEditorRoot({
  setCanDismiss,
  dismiss,
  ...props
}: PostEditorProps) {
  const dispatch = useAppDispatch();
  const [presentAlert] = useIonAlert();
  const router = useOptimizedIonRouter();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  const community =
    "existingPost" in props
      ? props.existingPost.community
      : props.community?.community;

  if (!community) throw new Error("community must be defined");

  const existingPost = "existingPost" in props ? props.existingPost : undefined;

  const isImage = useMemo(
    () =>
      existingPost?.post.url &&
      isUrlImage(existingPost.post.url, existingPost.post.url_content_type),
    [existingPost],
  );

  const initialImage = isImage ? existingPost!.post.url : undefined;

  const initialPostType = (() => {
    if (!existingPost) return "photo";

    if (initialImage) return "photo";

    if (existingPost.post.url) return "link";

    return "text";
  })();

  const initialTitle = existingPost?.post.name ?? "";

  const initialAltText = existingPost?.post.alt_text ?? "";

  const initialUrl = initialImage ? "" : (existingPost?.post.url ?? "");

  const initialText = existingPost?.post.body ?? "";

  const initialNsfw = existingPost?.post.nsfw ?? false;

  const [postType, setPostType] = useState<PostType>(initialPostType);
  const client = useClient();
  const presentToast = useAppToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [altText, setAltText] = useState(initialAltText);
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText);
  const [nsfw, setNsfw] = useState(initialNsfw);

  const [photoUrl, setPhotoUrl] = useState(initialImage ?? "");
  const [photoPreviewURL, setPhotoPreviewURL] = useState<string | undefined>(
    initialImage,
  );
  const [photoUploading, setPhotoUploading] = useState(false);

  const showAutofill = !!url && isValidUrl(url) && !title;

  const showNsfwToggle = !!(
    (postType === "photo" && photoPreviewURL) ||
    (postType === "link" && url)
  );

  useEffect(() => {
    setCanDismiss(
      initialPostType === postType &&
        text === initialText &&
        title === initialTitle &&
        url === initialUrl &&
        photoPreviewURL === initialImage &&
        initialNsfw === (showNsfwToggle && nsfw), // if not showing toggle, it's not nsfw
    );
  }, [
    initialPostType,
    postType,
    setCanDismiss,
    text,
    title,
    url,
    photoPreviewURL,
    initialText,
    initialTitle,
    initialUrl,
    initialImage,
    initialNsfw,
    showNsfwToggle,
    nsfw,
  ]);

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
    if (!community) return;

    // super hacky, I know... but current value submitted
    // from child is needed for submit
    const text = await new Promise<string>((resolve) =>
      setText((text) => {
        resolve(text);
        return text;
      }),
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

    const postAltText = (() => {
      switch (postType) {
        case "link":
        default:
          return undefined;
        case "photo":
          return altText;
      }
    })();

    let errorMessage: string | undefined;

    if (!title) {
      errorMessage = "Please add a title to your post.";
    } else if (title.length < 3) {
      errorMessage = "Post title must contain at least three characters.";
    } else if (
      postType === "link" &&
      (!url || !isValidUrl(url, { allowRelative: false }))
    ) {
      errorMessage =
        "Please add a valid URL to your post (start with https://).";
    } else if (postType === "photo" && !photoUrl) {
      errorMessage = "Please add a photo to your post.";
    } else if (!canSubmit()) {
      errorMessage =
        "It looks like you're missing some information to submit this post. Please double check.";
    }

    if (errorMessage) {
      presentToast({
        message: errorMessage,
        color: "warning",
        fullscreen: true,
      });

      return;
    }

    setLoading(true);

    let postResponse;

    const payload: Pick<Post, "name" | "url" | "body" | "nsfw" | "alt_text"> = {
      name: title,
      url: postUrl,
      body: text || undefined,
      nsfw: showNsfwToggle && nsfw,
      alt_text: postAltText,
    };

    try {
      if (existingPost) {
        postResponse = await client.editPost({
          post_id: existingPost.post.id,
          ...payload,
        });
      } else {
        postResponse = await client.createPost({
          community_id: community.id,
          ...payload,
        });
      }
    } catch (error) {
      presentToast({
        message: "Problem submitting your post. Please try again.",
        color: "danger",
        fullscreen: true,
      });

      throw error;
    } finally {
      setLoading(false);
    }

    dispatch(receivedPosts([postResponse.post_view]));

    if (existingPost) presentToast(postEdited);
    else
      presentToast(
        buildPostCreated((e, dismiss) => {
          router.push(
            buildGeneralBrowseLink(
              buildPostLink(
                postResponse.post_view.community,
                postResponse.post_view.post,
              ),
            ),
          );

          dismiss();
        }),
      );

    setCanDismiss(true);

    dismiss();
  }

  async function receivedImage(image: File) {
    setPhotoPreviewURL(URL.createObjectURL(image));
    setPhotoUploading(true);

    let imageUrl;

    // On Samsung devices, upload from photo picker will return DOM error on upload without timeout 🤬
    if (isAndroid()) await new Promise((resolve) => setTimeout(resolve, 250));

    try {
      imageUrl = await dispatch(uploadImage(image, "post-content"));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";

      presentToast({
        message: `Problem uploading image: ${message}. Please try again.`,
        color: "danger",
        fullscreen: true,
      });
      clearImage();

      throw error;
    } finally {
      setPhotoUploading(false);
    }

    dispatch(
      deletePendingImageUploads((img) => {
        if (img._context !== "post-content") return false;

        return img.url !== imageUrl;
      }),
    );

    setPhotoUrl(imageUrl);
  }

  function clearImage() {
    setPhotoUrl("");
    setPhotoPreviewURL(undefined);
  }

  async function fetchPostTitle() {
    let metadata;

    try {
      ({ metadata } = await client.getSiteMetadata({
        url,
      }));
    } catch (error) {
      presentToast(problemFetchingTitle);
      throw error;
    }

    if (!metadata.title) {
      presentToast(problemFetchingTitle);
      return;
    }

    setTitle(metadata.title?.slice(0, MAX_TITLE_LENGTH));
  }

  async function openCaptionPrompt() {
    presentAlert({
      message: "Add an accessible caption",
      inputs: [
        {
          type: "textarea",
          value: altText,
          placeholder: "Fluffy fur blankets the feline",
          name: "altText",
          attributes: { rows: 3 },
        },
      ],
      buttons: [
        { text: "Cancel", role: "cancel" },
        {
          text: altText ? "Update" : "Add",
          handler: ({ altText }) => {
            setAltText(altText);
          },
        },
      ],
    });
  }

  const postButtonDisabled = loading || !canSubmit();

  return (
    <>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => dismiss()}>Cancel</IonButton>
          </IonButtons>
          <IonTitle>
            {existingPost ? "Edit Post" : <>{startCase(postType)} Post</>}
          </IonTitle>
          <IonButtons slot="end">
            {loading ? (
              <IonSpinner />
            ) : (
              <IonButton
                color={postButtonDisabled ? "medium" : undefined}
                strong
                type="submit"
                disabled={postButtonDisabled}
                onClick={submit}
              >
                {existingPost ? "Save" : "Post"}
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSegment
            className={styles.segment}
            value={postType}
            onIonChange={(e) => setPostType(e.target.value as PostType)}
          >
            <IonSegmentButton value="photo">Photo</IonSegmentButton>
            <IonSegmentButton value="link">Link</IonSegmentButton>
            <IonSegmentButton value="text">Text</IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </AppHeader>
      <IonContent>
        <div className={styles.container}>
          <IonList>
            <IonItem>
              <IonInput
                className={styles.ionInputTitle}
                value={title}
                clearInput
                onIonInput={(e) => setTitle(e.detail.value ?? "")}
                placeholder="Title"
                counter
                inputMode="text"
                autocapitalize="on"
                autocorrect="on"
                spellCheck
                maxlength={MAX_TITLE_LENGTH}
                counterFormatter={(inputLength, maxLength) =>
                  showAutofill ? "" : `${maxLength - inputLength}`
                }
              />
              {showAutofill && (
                <IonButton
                  onClick={(e) => {
                    e.preventDefault();
                    fetchPostTitle();
                  }}
                  color="light"
                >
                  Autofill
                </IonButton>
              )}
            </IonItem>
            {postType === "photo" && (
              <>
                <label htmlFor="photo-upload-post">
                  <IonItem>
                    <IonLabel color="primary">
                      <IonIcon
                        className={styles.cameraIcon}
                        icon={cameraOutline}
                      />{" "}
                      Choose Photo
                    </IonLabel>

                    <input
                      type="file"
                      accept="image/*"
                      id="photo-upload-post"
                      className={styles.hiddenInput}
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
                    <IonButton
                      fill={altText ? "solid" : "outline"}
                      shape="round"
                      tabIndex={0}
                      aria-label="Caption this image"
                      onClick={openCaptionPrompt}
                    >
                      <IonIcon slot="icon-only" icon={accessibility} />
                    </IonButton>
                  </IonItem>
                )}
              </>
            )}
            {postType === "link" && (
              <IonItem>
                <IonInput
                  placeholder="https://aspca.org"
                  inputMode="url"
                  clearInput
                  value={url}
                  onIonInput={(e) => setUrl(e.detail.value ?? "")}
                />
              </IonItem>
            )}
            {showNsfwToggle && (
              <IonItem>
                <IonToggle
                  checked={nsfw}
                  onIonChange={(e) => setNsfw(e.detail.checked)}
                >
                  <IonText color="medium">NSFW</IonText>
                </IonToggle>
              </IonItem>
            )}
            <IonNavLink
              routerDirection="forward"
              component={() => (
                <NewPostText
                  value={text}
                  setValue={setText}
                  onSubmit={submit}
                  editing={"existingPost" in props}
                  dismiss={dismiss}
                />
              )}
            >
              <IonItem detail>
                <IonLabel
                  color={!text ? "medium" : undefined}
                  className="ion-text-nowrap"
                >
                  {!text ? "Text (optional)" : text}
                </IonLabel>
              </IonItem>
            </IonNavLink>
          </IonList>

          <div className={styles.postingIn}>
            Posting in {getRemoteHandle(community)}
          </div>
        </div>
      </IonContent>
    </>
  );
}
