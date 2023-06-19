import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from "@ionic/react";
import Posts from "../components/Posts";
import { useParams } from "react-router";
import { PageContext } from "../features/auth/PageContext";
import { useRef } from "react";
import PostSort from "../components/PostSort";
import PostFilter from "../components/PostFilter";
import { ListingType } from "lemmy-js-client";

interface SpecialFeedProps {
  type: ListingType;
}

export default function SpecialFeedPage({ type }: SpecialFeedProps) {
  const { actor } = useParams<{ actor: string }>();
  const pageRef = useRef<HTMLElement | undefined>();

  return (
    <IonPage ref={pageRef}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              text="Communities"
              defaultHref={`/instance/${actor}`}
            />
          </IonButtons>

          <IonTitle>{listingTypeTitle(type)}</IonTitle>

          <IonButtons slot="end">
            <PostSort />
            <PostFilter />
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
