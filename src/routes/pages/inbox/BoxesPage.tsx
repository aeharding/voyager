import {
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from "@ionic/react";
import AppContent from "../../../features/shared/AppContent";
import {
  albumsOutline,
  chatbubbleOutline,
  ellipseOutline,
  fileTray,
  mail,
  personCircleOutline,
} from "ionicons/icons";
import { useAppDispatch } from "../../../store";
import { getInboxCounts } from "../../../features/inbox/inboxSlice";
import { MouseEvent, useContext, useRef } from "react";
import { PageContext } from "../../../features/auth/PageContext";
import { useSetActivePage } from "../../../features/auth/AppContext";
import BoxesRedirectBootstrapper from "../../../features/inbox/BoxesRedirectBootstrapper";
import AppHeader from "../../../features/shared/AppHeader";

export default function BoxesPage() {
  const pageRef = useRef<HTMLElement>(null);
  const dispatch = useAppDispatch();

  const { presentLoginIfNeeded } = useContext(PageContext);

  useSetActivePage(pageRef);

  useIonViewWillEnter(() => {
    dispatch(getInboxCounts());
  });

  function interceptIfLoggedOut(e: MouseEvent) {
    if (presentLoginIfNeeded()) e.preventDefault();
  }

  return (
    <>
      <BoxesRedirectBootstrapper />
      <IonPage ref={pageRef} className="grey-bg">
        <AppHeader>
          <IonToolbar>
            <IonTitle>Boxes</IonTitle>
          </IonToolbar>
        </AppHeader>
        <AppContent scrollY fullscreen>
          <AppHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">Boxes</IonTitle>
            </IonToolbar>
          </AppHeader>

          <IonList inset color="primary">
            <IonItem routerLink="/inbox/all" onClick={interceptIfLoggedOut}>
              <IonIcon icon={fileTray} color="primary" />
              <IonLabel className="ion-text-nowrap">Inbox (All)</IonLabel>
            </IonItem>
            <IonItem routerLink="/inbox/unread" onClick={interceptIfLoggedOut}>
              <IonIcon icon={ellipseOutline} color="primary" />
              <IonLabel className="ion-text-nowrap">Unread</IonLabel>
            </IonItem>
          </IonList>

          <IonList inset color="primary">
            <IonItem
              routerLink="/inbox/post-replies"
              onClick={interceptIfLoggedOut}
            >
              <IonIcon icon={albumsOutline} color="primary" />
              <IonLabel className="ion-text-nowrap">Post Replies</IonLabel>
            </IonItem>
            <IonItem
              routerLink="/inbox/comment-replies"
              onClick={interceptIfLoggedOut}
            >
              <IonIcon icon={chatbubbleOutline} color="primary" />
              <IonLabel className="ion-text-nowrap">Comment Replies</IonLabel>
            </IonItem>
            <IonItem
              routerLink="/inbox/mentions"
              onClick={interceptIfLoggedOut}
            >
              <IonIcon icon={personCircleOutline} color="primary" />
              <IonLabel className="ion-text-nowrap">Mentions</IonLabel>
            </IonItem>
          </IonList>

          <IonList inset color="primary">
            <IonItem
              routerLink="/inbox/messages"
              onClick={interceptIfLoggedOut}
            >
              <IonIcon icon={mail} color="primary" />
              <IonLabel className="ion-text-nowrap">Messages</IonLabel>
            </IonItem>
          </IonList>
        </AppContent>
      </IonPage>
    </>
  );
}
