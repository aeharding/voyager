import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../store";
import { useCallback } from "react";
import { jwtSelector } from "../../features/auth/authSlice";
import { receivedApplications } from "../../features/registration-applications/registrationApplicationSlice";
import ApplicationFeed from "../../features/feed/ApplicationFeed";
import { FetchFn } from "../../features/feed/Feed";
import { RegistrationApplicationView } from "lemmy-js-client";
import useClient from "../../helpers/useClient";

interface ApplicationsPageProps {
  unreadOnly?: boolean;
}

export default function ApplicationsPage({
  unreadOnly = false,
}: ApplicationsPageProps) {
  const dispatch = useAppDispatch();
  const jwt = useAppSelector(jwtSelector);
  const client = useClient();

  const fetchFn: FetchFn<RegistrationApplicationView> = useCallback(
    async (page) => {
      if (!jwt) throw new Error("user must be authed");

      // TODO - actually paginate properly if Lemmy implements
      // reply pagination filtering by comment and post
      const response = await client.listRegistrationApplications({
        limit: 50,
        page,
        auth: jwt,
        unread_only: unreadOnly,
      });

      dispatch(receivedApplications(response.registration_applications));

      return response.registration_applications;
    },
    [client, jwt, dispatch, unreadOnly]
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/inbox" text="Boxes" />
          </IonButtons>

          <IonTitle>Registration Applications</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonContent>
          <ApplicationFeed fetchFn={fetchFn} />
        </IonContent>
      </IonContent>
    </IonPage>
  );
}
