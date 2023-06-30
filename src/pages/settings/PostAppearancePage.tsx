import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "../../features/shared/AppContent";
import PostsViewSelection from "../../features/settings/appearance/posts/PostsViewSelection";

export default function PostAppearancePage() {
  return (
    <IonPage className="grey-bg">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              defaultHref="/settings/appearance"
              text="Appearance"
            />
          </IonButtons>

          <IonTitle>Posts</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent scrollY>
        <PostsViewSelection />
      </AppContent>
    </IonPage>
  );
}
