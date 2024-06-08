import { styled } from "@linaria/react";
import FloatingDialog from "../../../../helpers/FloatingDialog";
import Crosspost from "../Crosspost";
import { CommunityView, PostView } from "lemmy-js-client";
import {
  IonButton,
  IonInput,
  IonItem,
  IonList,
  IonSpinner,
  IonText,
  useIonModal,
} from "@ionic/react";
import { useContext, useEffect, useState } from "react";
import CommunitySelectorModal from "../../../shared/selectorModals/CommunitySelectorModal";
import { PageContext } from "../../../auth/PageContext";
import { buildCrosspostBody, getHandle } from "../../../../helpers/lemmy";
import useClient from "../../../../helpers/useClient";
import { useBuildGeneralBrowseLink } from "../../../../helpers/routes";
import { buildPostLink } from "../../../../helpers/appLinkBuilder";
import { receivedPosts } from "../../postSlice";
import { useOptimizedIonRouter } from "../../../../helpers/useOptimizedIonRouter";
import { useAppDispatch } from "../../../../store";
import useAppToast from "../../../../helpers/useAppToast";
import { checkmark } from "ionicons/icons";
import { StatusBar } from "@capacitor/status-bar";
import { isNative } from "../../../../helpers/device";

const Title = styled.div`
  font-size: 1.1em;
  line-height: 1rem;
  font-weight: bold;
`;

const PillIonInput = styled(IonInput)`
  --padding-start: 12px;
  --padding-end: 12px;

  border-radius: 0.5rem;
  background: var(--ion-item-background, var(--ion-background-color, #fff));
`;

const ReadonlyCrosspost = styled(Crosspost)`
  pointer-events: none;

  background: var(--ion-item-background, var(--ion-background-color, #fff));
`;

const PillIonButton = styled(IonButton)`
  width: 100%;
  --border-radius: 0.5rem;
`;

const PillIonList = styled(IonList)`
  width: 100%;

  && {
    margin: 0;
  }
`;

const LoadingIonSpinner = styled(IonSpinner)`
  margin-left: 16px;
`;

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
      presentToast({
        message: "Failed to create crosspost",
        color: "danger",
        centerText: true,
      });
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

    presentToast({
      message: "Crossposted!",
      color: "primary",
      position: "top",
      centerText: true,
      fullscreen: true,
      icon: checkmark,
    });
  }

  return (
    <FloatingDialog onDismiss={onDismiss}>
      <Title>Crosspost</Title>

      <PillIonInput
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
      </PillIonInput>
      <ReadonlyCrosspost post={post} url={post.post.ap_id} />
      <PillIonList inset>
        <IonItem
          onClick={() => presentCommunitySelectorModal({ cssClass: "small" })}
        >
          Community
          <IonText
            slot="end"
            color={!community ? "medium" : undefined}
            className="ion-text-end"
          >
            {community ? getHandle(community.community) : "None"}
          </IonText>
        </IonItem>
      </PillIonList>
      <PillIonButton
        color={canPost ? "primary" : "dark"}
        disabled={!canPost || loading}
        onClick={submit}
      >
        Crosspost{loading && <LoadingIonSpinner />}
      </PillIonButton>
    </FloatingDialog>
  );
}
