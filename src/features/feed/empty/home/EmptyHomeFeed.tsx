import { IonIcon, useIonModal } from "@ionic/react";
import { IonItem } from "@ionic/react";
import { IonList } from "@ionic/react";
import { IonText } from "@ionic/react";
import { duplicateOutline, earthOutline } from "ionicons/icons";
import { use, useEffect } from "react";

import { PageContext } from "#/features/auth/PageContext";
import { MaxWidthContainer } from "#/features/shared/AppContent";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import { FeedContentColorContext } from "#/routes/pages/shared/FeedContent";

import StarterPacksModal from "./StarterPacksModal";

export default function EmptyHomeFeed() {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const router = useOptimizedIonRouter();
  const { setColor } = use(FeedContentColorContext);
  const { pageRef } = use(PageContext);
  const [presentStarterPacksModal, onDismissStarterPacks] = useIonModal(
    StarterPacksModal,
    {
      onDismiss: () => onDismissStarterPacks(),
    },
  );

  useEffect(() => {
    setColor("light-bg");

    return () => {
      setColor(undefined);
    };
  }, [setColor]);

  return (
    <MaxWidthContainer>
      <div className="ion-padding">
        <p>
          This is your{" "}
          <IonText color="primary">
            <strong>home feed</strong>
          </IonText>
          . It shows posts from communities you follow. But it&apos;s empty
          right now!
        </p>
        <p>
          <strong>Follow some communities to get started.</strong> Then,{" "}
          <strong>pull to refresh.</strong> Or browse{" "}
          <IonText color="primary">
            <strong>all posts</strong>
          </IonText>{" "}
          to see everything.
        </p>
      </div>
      <IonList inset>
        <IonItem
          onClick={() =>
            router.push(buildGeneralBrowseLink("/all"), "none", "replace")
          }
          button
        >
          <IonIcon icon={earthOutline} slot="start" color="primary" /> All Posts
        </IonItem>
        <IonItem
          button
          onClick={() =>
            presentStarterPacksModal({
              presentingElement:
                pageRef?.current?.closest("ion-tabs") ?? undefined,
            })
          }
        >
          <IonIcon icon={duplicateOutline} slot="start" color="primary" />
          Starter Community Packs
        </IonItem>
      </IonList>
    </MaxWidthContainer>
  );
}
