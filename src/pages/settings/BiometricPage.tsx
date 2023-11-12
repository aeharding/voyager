import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "../../features/shared/AppContent";
import { useSetActivePage } from "../../features/auth/AppContext";
import { useRef } from "react";
import BiometricTitle from "../../features/settings/biometric/biometricTitle";
import { InsetIonItem } from "../profile/ProfileFeedItemsPage";

export default function BiometricPage() {
  const pageRef = useRef<HTMLElement>(null);

  useSetActivePage(pageRef);

  return (
    <IonPage className="grey-bg" ref={pageRef}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text="Settings" defaultHref="/settings" />
          </IonButtons>

          <IonTitle>
            <BiometricTitle />
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent scrollY fullscreen>
        <IonList inset color="primary">
          <InsetIonItem>
            <IonLabel>
              Lock with <BiometricTitle />
            </IonLabel>
            <IonToggle
              checked={true}
              //   onIonChange={() =>
              // dispatch(
              //   setFontSizeMultiplier(
              //     fontSizeMultiplier >= MIN_LARGER_FONT_ADJUSTMENT
              //       ? MAX_REGULAR_FONT_ADJUSTMENT
              //       : MIN_LARGER_FONT_ADJUSTMENT,
              //   ),
              // )
              //   }
            />
          </InsetIonItem>
        </IonList>
      </AppContent>
    </IonPage>
  );
}
