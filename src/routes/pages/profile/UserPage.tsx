import {
  IonBackButton,
  IonButtons,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useParams } from "react-router";

import {
  userHandleSelector,
  usernameSelector,
} from "#/features/auth/authSelectors";
import AppHeader from "#/features/shared/AppHeader";
import DocumentTitle from "#/features/shared/DocumentTitle";
import AsyncProfile from "#/features/user/AsyncProfile";
import ProfilePageActions from "#/features/user/ProfilePageActions";
import UserPageActions from "#/features/user/UserPageActions";
import FeedContent from "#/routes/pages/shared/FeedContent";
import { useAppSelector } from "#/store";

interface UserPageProps {
  handle: string;
}

export default function UserPage() {
  const { handle } = useParams<{ handle: string }>();

  return <UserPageContent handle={handle} />;
}

function UserPageContent({ handle }: UserPageProps) {
  const myUsername = useAppSelector(usernameSelector);
  const myHandle = useAppSelector(userHandleSelector);
  const isSelf = handle === myUsername || handle === myHandle;

  return (
    <IonPage className="grey-bg">
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>

          <DocumentTitle>{handle}</DocumentTitle>
          <IonTitle>{handle}</IonTitle>

          <IonButtons slot="end">
            {isSelf ? (
              <ProfilePageActions />
            ) : (
              <UserPageActions handle={handle} />
            )}
          </IonButtons>
        </IonToolbar>
      </AppHeader>
      <FeedContent>
        <AsyncProfile handle={handle} />
      </FeedContent>
    </IonPage>
  );
}
