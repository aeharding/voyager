import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "../../features/shared/AppContent";
import ManageInstances from "../../features/settings/manage-instances/ManageInstances";
import { useRef, useState } from "react";
import { useSetActivePage } from "../../features/auth/AppContext";

export default function ManageInstancesPage() {
  const pageRef = useRef<HTMLElement>(null);
  const [editing, setEditing] = useState(false);

  useSetActivePage(pageRef);

  return (
    <IonPage ref={pageRef} className="grey-bg">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>

          <IonTitle>Manage Instances</IonTitle>

          <IonButtons slot="end">
            {editing ? (
              <IonButton onClick={() => setEditing(false)}>Done</IonButton>
            ) : (
              <IonButton onClick={() => setEditing(true)}>Edit</IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <AppContent scrollY>
        <ManageInstances editing={editing} />
      </AppContent>
    </IonPage>
  );
}
