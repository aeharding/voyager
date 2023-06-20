import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import Posts from "../components/Posts";
import { PageContext } from "../features/auth/PageContext";
import { useRef } from "react";
import PostSort from "../components/PostSort";
import { ListingType } from "lemmy-js-client";
import { useBuildGeneralBrowseLink } from "../helpers/routes";

interface SpecialFeedProps {
  type: ListingType;
}

export default function SpecialFeedPage({ type }: SpecialFeedProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const pageRef = useRef<HTMLElement | undefined>();

  return (
    <IonPage ref={pageRef}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              text="Communities"
              defaultHref={buildGeneralBrowseLink("")}
            />
          </IonButtons>

          <IonTitle>{listingTypeTitle(type)}</IonTitle>

          <IonButtons slot="end">
            <PostSort />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <PageContext.Provider value={{ page: pageRef.current }}>
          <Posts type={type} />
        </PageContext.Provider>
      </IonContent>
    </IonPage>
  );
}

function listingTypeTitle(type: ListingType): string {
  switch (type) {
    case ListingType.All:
    case ListingType.Local:
      return type;
    case ListingType.Subscribed:
      return "Home";
    case ListingType.Community:
      return "Community";
  }
}
