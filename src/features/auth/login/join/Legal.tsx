import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonList,
  IonNavLink,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useAppSelector } from "../../../../store";
import Markdown from "../../../shared/Markdown";
import Question from "./Question";
import Join from "./Join";

export default function Legal() {
  const { url, site } = useAppSelector((state) => state.join);

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Privacy &amp; Terms</IonTitle>
          <IonButtons slot="end">
            <IonNavLink
              component={() => {
                if (
                  site?.site_view.local_site.application_question &&
                  site?.site_view.local_site.registration_mode ===
                    "RequireApplication"
                )
                  return <Question />;

                return <Join />;
              }}
            >
              <IonButton strong>I Agree</IonButton>
            </IonNavLink>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Privacy &amp; Terms</IonTitle>
          </IonToolbar>
        </IonHeader>

        <p className="ion-padding">
          The admins of {url} would like you to read over the following.
        </p>

        <IonList inset className="ion-padding">
          <Markdown className="collapse-md-margins">
            {site?.site_view.local_site.legal_information}
          </Markdown>
        </IonList>
      </IonContent>
    </>
  );
}
