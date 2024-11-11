import {
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { arrowBackSharp } from "ionicons/icons";
import { useId } from "react";

import CommentMarkdown from "#/features/comment/CommentMarkdown";
import { isIosTheme } from "#/helpers/device";

import AppHeader from "../../AppHeader";
import Markdown from "../Markdown";

interface PreviewModalProps {
  text: string;
  type: "comment" | "post";
  onDismiss: (data?: string, role?: string) => void;
}

export default function PreviewModal({
  type,
  text,
  onDismiss,
}: PreviewModalProps) {
  const id = useId();

  const content = (() => {
    // disableInternalLinkRouting to prevent internal links (like @test@example.com)
    // from taking user away from current page (since user is in a modal)
    //
    // TODO future - push internal routes onto the `ion-nav`? might be cool!
    switch (type) {
      case "comment":
        return (
          <CommentMarkdown disableInternalLinkRouting id={id}>
            {text}
          </CommentMarkdown>
        );
      case "post":
        return (
          <Markdown disableInternalLinkRouting id={id}>
            {text}
          </Markdown>
        );
    }
  })();

  return (
    <IonPage>
      <AppHeader>
        <IonToolbar>
          {isIosTheme() ? (
            <IonButtons slot="primary">
              <IonButton strong onClick={() => onDismiss()}>
                Done
              </IonButton>
            </IonButtons>
          ) : (
            <IonButtons slot="start">
              <IonButton onClick={() => onDismiss()}>
                <IonIcon icon={arrowBackSharp} slot="icon-only" />
              </IonButton>
            </IonButtons>
          )}
          <IonTitle>Preview</IonTitle>
        </IonToolbar>
      </AppHeader>
      <IonContent className="ion-padding">{content}</IonContent>
    </IonPage>
  );
}
