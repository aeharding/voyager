import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "../../../features/shared/AppContent";
import {
  TitleContainer,
  UsernameIonText,
} from "../../../features/comment/compose/reply/CommentReply";
import { useAppSelector } from "../../../store";
import { userHandleSelector } from "../../../features/auth/authSelectors";
import FilterNsfw from "../../../features/settings/blocks/FilterNsfw";
import BlockedCommunities from "../../../features/settings/blocks/BlockedCommunities";
import { CenteredSpinner } from "../posts/PostPage";
import BlockedUsers from "../../../features/settings/blocks/BlockedUsers";
import FilteredKeywords from "../../../features/settings/blocks/FilteredKeywords";
import BlockedInstances from "../../../features/settings/blocks/BlockedInstances";
import { useRef } from "react";
import { useSetActivePage } from "../../../features/auth/AppContext";
import { localUserSelector } from "../../../features/auth/siteSlice";
import AppHeader from "../../../features/shared/AppHeader";

export default function BlocksSettingsPage() {
  const pageRef = useRef<HTMLElement>(null);

  const userHandle = useAppSelector(userHandleSelector);
  const localUser = useAppSelector(localUserSelector);

  useSetActivePage(pageRef);

  return (
    <IonPage ref={pageRef} className="grey-bg">
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>

          <IonTitle>
            <TitleContainer>
              <IonText>Filters & Blocks</IonText>
              <div>
                <UsernameIonText color="medium">{userHandle}</UsernameIonText>
              </div>
            </TitleContainer>{" "}
          </IonTitle>
        </IonToolbar>
      </AppHeader>
      {localUser ? (
        <AppContent scrollY>
          <FilterNsfw />
          <FilteredKeywords />
          <BlockedCommunities />
          <BlockedUsers />
          <BlockedInstances />
        </AppContent>
      ) : (
        <IonContent scrollY={false}>
          <CenteredSpinner />
        </IonContent>
      )}
    </IonPage>
  );
}
