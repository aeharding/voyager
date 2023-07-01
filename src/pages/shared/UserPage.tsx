import React from "react";
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonTitle,
  IonToolbar,
  useIonAlert,
  useIonRouter,
} from "@ionic/react";
import { useEffect, useRef, useState } from "react";
import Profile from "../../features/user/Profile";
import { useParams } from "react-router";
import { GetPersonDetailsResponse } from "lemmy-js-client";
import styled from "@emotion/styled";
import { useAppDispatch } from "../../store";
import { getUser } from "../../features/user/userSlice";
import { useSetActivePage } from "../../features/auth/AppContext";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";

export const PageContentIonSpinner = styled(IonSpinner)`
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const FailedMessage = styled.div`
  margin-top: 25vh;
  text-align: center;
  color: var(--ion-color-medium);
`;

interface UserPageProps {
  handle?: string;
  toolbar?: React.ReactNode;
}

export default function UserPage(props: UserPageProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const handle = useParams<{ handle: string }>().handle ?? props.handle;
  const dispatch = useAppDispatch();
  const [person, setPerson] = useState<
    GetPersonDetailsResponse | "failed" | undefined
  >();
  const pageRef = useRef();
  const router = useIonRouter();
  const [present] = useIonAlert();

  useEffect(() => {
    if (handle) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle]);

  useSetActivePage(pageRef.current);

  async function load() {
    let data;

    try {
      data = await dispatch(getUser(handle));
    } catch (error) {
      if (error === "couldnt_find_that_username_or_email") {
        await present(`Huh, u/${handle} doesn't exist. Mysterious...`);

        if (router.canGoBack()) {
          router.goBack();
        } else {
          router.push(buildGeneralBrowseLink("/"));
        }

        throw error;
      }

      setPerson("failed");

      throw error;
    }

    setPerson(data);
  }

  function renderContents() {
    if (!person) return <PageContentIonSpinner />;

    if (person === "failed")
      return <FailedMessage>failed to load user profile 😢</FailedMessage>;

    return <Profile person={person} />;
  }

  return (
    <IonPage ref={pageRef} className="grey-bg">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            {!props.toolbar ? <IonBackButton /> : props.toolbar}
          </IonButtons>

          <IonTitle>{handle}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRefresher
          slot="fixed"
          onIonRefresh={async (e) => {
            try {
              await load();
            } finally {
              e.detail.complete();
            }
          }}
        >
          <IonRefresherContent />
        </IonRefresher>
        {renderContents()}
      </IonContent>
    </IonPage>
  );
}
