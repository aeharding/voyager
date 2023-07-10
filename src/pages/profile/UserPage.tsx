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
import UserPageActions from "../../features/user/UserPageActions";
import { useAppSelector } from "../../store";
import {
  handleSelector,
  usernameSelector,
} from "../../features/auth/authSlice";

export default function UserPage() {
  const handle = useParams<{ handle: string }>().handle;
  const pageRef = useRef();
  const myUsername = useAppSelector(usernameSelector);
  const myHandle = useAppSelector(handleSelector);
  const isSelf = handle === myUsername || handle === myHandle;

  useSetActivePage(pageRef.current);

  return (
    <IonPage className="grey-bg" ref={pageRef}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>

          <IonTitle>{handle}</IonTitle>

          {!isSelf && (
            <IonButtons slot="end">
              <UserPageActions handle={handle} />
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <AsyncProfile handle={handle} />
      </IonContent>
    </IonPage>
  );
}
