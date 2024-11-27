import { StatusBar } from "@capacitor/status-bar";
import {
  IonButton,
  IonInput,
  IonItem,
  IonList,
  IonSpinner,
  IonText,
  useIonModal,
} from "@ionic/react";
import { CommunityView, PostView } from "lemmy-js-client";
import { useContext, useEffect, useState } from "react";

import { PageContext } from "#/features/auth/PageContext";
import CommunitySelectorModal from "#/features/shared/selectorModals/CommunitySelectorModal";
import { buildPostLink } from "#/helpers/appLinkBuilder";
import { isNative } from "#/helpers/device";
import FloatingDialog from "#/helpers/FloatingDialog";
import { buildCrosspostBody, getHandle } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { crosspostFailed, crosspostSuccess } from "#/helpers/toastMessages";
import useAppToast from "#/helpers/useAppToast";
import useClient from "#/helpers/useClient";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import { useAppDispatch } from "#/store";

import { receivedPosts } from "../../postSlice";
import Crosspost from "../Crosspost";

import styles from "./CreateCrosspostDialog.module.css";

interface CreateCrosspostDialogProps {
  onDismiss: () => void;
  post: PostView;
}

export default function CreateCrosspostDialog({
  onDismiss,
  post,
}: CreateCrosspostDialogProps) {
  const [title, setTitle] = useState("");
  const [community, setCommunity] = useState<CommunityView | undefined>();
  const { pageRef } = useContext(PageContext);
  const client = useClient();
  const dispatch = useAppDispatch();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const router = useOptimizedIonRouter();
  const [loading, setLoading] = useState(false);
  const presentToast = useAppToast();

  const [presentCommunitySelectorModal, onDismissCommunitySelector] =
    useIonModal(CommunitySelectorModal, {
      onDismiss: (data?: CommunityView) => {
        if (data) setCommunity(data);
        onDismissCommunitySelector();
      },
      pageRef,
    });

  useEffect(() => {
    if (!isNative()) return;

    StatusBar.hide();

    return () => {
      StatusBar.show();
    };
  }, []);

  const canPost = title && community;

  async function submit() {
    if (!canPost) return;

    setLoading(true);

    let postResponse;

    try {
      postResponse = await client.createPost({
        name: title,
        url: post.post.url,
        nsfw: post.post.nsfw,
        body: buildCrosspostBody(post.post, title !== post.post.name),
        community_id: community.community.id,
      });
    } catch (error) {
      presentToast(crosspostFailed);
      throw error;
    } finally {
      setLoading(false);
    }

    dispatch(receivedPosts([postResponse.post_view]));

    router.push(
      buildGeneralBrowseLink(
        buildPostLink(
          postResponse.post_view.community,
          postResponse.post_view.post,
        ),
      ),
    );

    onDismiss();

    presentToast(crosspostSuccess);
  }

  return (
    <FloatingDialog onDismiss={onDismiss}>
      <div className={styles.title}>Crosspost</div>

      <IonInput
        className={styles.pillIonInput}
        aria-label="Title"
        placeholder="Title"
        value={title}
        onIonInput={(e) => setTitle(e.detail.value || "")}
        inputMode="text"
        autocapitalize="on"
        autocorrect="on"
        spellCheck
        // clearInput // TODO add once below bug fixed
      >
        {/* https://github.com/ionic-team/ionic-framework/issues/28855 */}
        <div slot="end">
          {!title && (
            <IonButton
              color="light"
              size="small"
              onClick={(e) => {
                setTitle(post.post.name);
                e.preventDefault();
              }}
            >
              Autofill
            </IonButton>
          )}
        </div>
      </IonInput>
      <Crosspost
        className={styles.readonlyCrosspost}
        post={post}
        url={post.post.ap_id}
      />
      <IonList inset className={styles.pillIonList}>
        <IonItem
          onClick={() => presentCommunitySelectorModal({ cssClass: "small" })}
        >
          <div className={styles.communitySelectorContents}>
            <div>Community</div>
            <IonText
              color={!community ? "medium" : undefined}
              className={styles.ellipsis}
            >
              {community ? getHandle(community.community) : "None"}
            </IonText>
          </div>
        </IonItem>
      </IonList>
      <IonButton
        className={styles.pillIonButton}
        color={canPost ? "primary" : "dark"}
        disabled={!canPost || loading}
        onClick={submit}
      >
        Crosspost{loading && <IonSpinner className="ion-margin-start" />}
      </IonButton>
    </FloatingDialog>
  );
}
