import {
  IonChip,
  IonIcon,
  IonItem,
  IonText,
  useIonAlert,
  useIonModal,
} from "@ionic/react";
import {
  duplicateOutline,
  earthOutline,
  helpCircleOutline,
} from "ionicons/icons";

import StarterPacksModal from "#/features/feed/empty/home/StarterPacksModal";
import { MaxWidthContainer } from "#/features/shared/AppContent";
import { useAppPageRef } from "#/helpers/AppPage";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";

import styles from "./EmptyCommunities.module.css";

export default function EmptyCommunities() {
  const router = useOptimizedIonRouter();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const [presentAlert] = useIonAlert();

  const pageRef = useAppPageRef();
  const [presentStarterPacksModal, onDismissStarterPacks] = useIonModal(
    StarterPacksModal,
    {
      onDismiss: () => onDismissStarterPacks(),
    },
  );

  function onClickHelp() {
    presentAlert({
      header: "How to subscribe to a specific community",
      message:
        "Long press any community label, or tap the ellipsis icon in the header of any community feed. Then, tap subscribe.",
      buttons: ["OK"],
    });
  }

  return (
    <>
      <MaxWidthContainer>
        <div className="ion-padding-start ion-padding-end">
          <p>
            This is your{" "}
            <IonText color="primary">
              <strong>communities list</strong>
            </IonText>
            . It shows communities that you follow. But it&apos;s empty right
            now!
          </p>
          <p>
            When you <strong>subscribe to a community</strong>, it will show
            here. Go to the{" "}
            <IonChip
              outline
              className={styles.inlineChip}
              onClick={() => router.push(buildGeneralBrowseLink("/all"))}
            >
              <IonIcon icon={earthOutline} color="primary-fixed" />{" "}
              <strong>All</strong>
            </IonChip>{" "}
            feed above to start browsing.
          </p>
        </div>
        <IonItem
          button
          detail={false}
          onClick={() =>
            presentStarterPacksModal({
              presentingElement:
                pageRef?.current?.closest("ion-tabs") ?? undefined,
            })
          }
        >
          <IonIcon icon={duplicateOutline} slot="start" color="primary" />{" "}
          Starter Community Packs
        </IonItem>
        <IonItem onClick={onClickHelp} button detail={false}>
          <IonIcon icon={helpCircleOutline} slot="start" color="primary" /> How
          to Subscribe
        </IonItem>
      </MaxWidthContainer>
    </>
  );
}
