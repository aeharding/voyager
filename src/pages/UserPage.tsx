import {
  IonButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  useIonModal,
  useIonViewWillEnter,
} from "@ionic/react";
import AppContent from "../components/AppContent";
import { useContext, useEffect, useRef, useState } from "react";
import Profile from "../features/profile/Profile";
import { useParams } from "react-router";
import { PageContext } from "../features/auth/PageContext";
import { GetPersonDetailsResponse, PersonViewSafe } from "lemmy-js-client";
import styled from "@emotion/styled";
import { useAppDispatch } from "../store";
import { getUser } from "../features/user/userSlice";
import { AppContext } from "../features/auth/AppContext";

const PageContentIonSpinner = styled(IonSpinner)`
  position: relative;
  left: 50%;
  transform: translateX(-50%);

  margin-top: 5rem;
`;

interface UserPageProps {
  handle?: string;
  toolbar?: React.ReactNode;
}

export default function UserPage(props: UserPageProps) {
  const handle = useParams<{ handle: string }>().handle ?? props.handle;
  const dispatch = useAppDispatch();
  const [person, setPerson] = useState<GetPersonDetailsResponse | undefined>();
  const pageRef = useRef();
  const { setActivePage } = useContext(AppContext);

  useEffect(() => {
    if (handle) load();
  }, [handle]);

  useIonViewWillEnter(() => {
    if (pageRef.current) setActivePage(pageRef.current);
  });

  async function load() {
    const data = await dispatch(getUser(handle));
    setPerson(data);
  }

  return (
    <IonPage ref={pageRef}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{handle}</IonTitle>

          <IonButtons slot="end">{props.toolbar}</IonButtons>
        </IonToolbar>
      </IonHeader>
      <AppContent>
        <PageContext.Provider value={{ page: pageRef.current }}>
          {person ? <Profile person={person} /> : <PageContentIonSpinner />}
        </PageContext.Provider>
      </AppContent>
    </IonPage>
  );
}
