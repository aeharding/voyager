import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useParams } from "react-router";
import AsyncProfile from "../../features/user/AsyncProfile";
import { useRef } from "react";
import { useSetActivePage } from "../../features/auth/AppContext";

export default function UserPage() {
  const handle = useParams<{ handle: string }>().handle;
  const pageRef = useRef();

  useSetActivePage(pageRef.current);

  return (
    <IonPage className="grey-bg" ref={pageRef}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>

          <IonTitle>{handle}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <AsyncProfile handle={handle} />
      </IonContent>
    </IonPage>
  );
}
