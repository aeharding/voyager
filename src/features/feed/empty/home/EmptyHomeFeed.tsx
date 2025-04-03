import { IonIcon, useIonModal } from "@ionic/react";
import { IonItem } from "@ionic/react";
import { IonList } from "@ionic/react";
import { IonText } from "@ionic/react";
import { duplicateOutline, earthOutline } from "ionicons/icons";
import { use } from "react";

import { PageContext } from "#/features/auth/PageContext";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";

import CuratedCommunitiesModal from "./CuratedCommunitiesModal";
import { default as seedlingSvg } from "./seedling.svg";

import styles from "./EmptyHomeFeed.module.css";

export default function EmptyHomeFeed() {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  const { pageRef } = use(PageContext);
  const [presentCuratedCommunitiesModal, onDismissCuratedCommunities] =
    useIonModal(CuratedCommunitiesModal, {
      onDismiss: () => onDismissCuratedCommunities(),
    });

  return (
    <>
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
          <strong>pull to refresh.</strong> Or browse the{" "}
          <IonText color="primary">
            <strong>all feed</strong>
          </IonText>{" "}
          to see everything.
        </p>
      </div>
      <IonList inset>
        <IonItem routerLink={buildGeneralBrowseLink("/all")} button>
          <IonIcon icon={earthOutline} slot="start" color="primary" /> All Posts
        </IonItem>
        <IonItem
          button
          onClick={() =>
            presentCuratedCommunitiesModal({
              presentingElement:
                pageRef?.current?.closest("ion-tabs") ?? undefined,
            })
          }
        >
          <IonIcon icon={duplicateOutline} slot="start" color="primary" />
          Starter Community Packs
        </IonItem>
      </IonList>
      <img src={seedlingSvg} className={styles.seedling} />
    </>
  );
}
