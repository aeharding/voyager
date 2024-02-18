import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useParams } from "react-router";
import AsyncProfile from "../../../features/user/AsyncProfile";
import UserPageActions from "../../../features/user/UserPageActions";
import ProfilePageActions from "../../../features/user/ProfilePageActions";
import { useAppSelector } from "../../../store";
import {
  userHandleSelector,
  usernameSelector,
} from "../../../features/auth/authSelectors";
import FeedContent from "../shared/FeedContent";
import { memo } from "react";

interface UserPageProps {
  handle: string;
}

export default function UserPage() {
  const { handle } = useParams<{ handle: string }>();

  return <UserPageContent handle={handle} />;
}

const UserPageContent = memo(function UserPageContent({
  handle,
}: UserPageProps) {
  const myUsername = useAppSelector(usernameSelector);
  const myHandle = useAppSelector(userHandleSelector);
  const isSelf = handle === myUsername || handle === myHandle;

  return (
    <IonPage className="grey-bg">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>

          <IonTitle>{handle}</IonTitle>

          <IonButtons slot="end">
            {isSelf ? (
              <ProfilePageActions />
            ) : (
              <UserPageActions handle={handle} />
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <FeedContent>
        <AsyncProfile handle={handle} />
      </FeedContent>
    </IonPage>
  );
});
