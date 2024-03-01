import {
  IonButton,
  IonButtons,
  IonContent,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import Markdown from "../Markdown";
import CommentMarkdown from "../../../comment/CommentMarkdown";
import AppHeader from "../../AppHeader";
import { useId } from "react";

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
          <IonButtons slot="end">
            <IonButton color="primary" strong onClick={() => onDismiss()}>
              Done
            </IonButton>
          </IonButtons>
          <IonTitle>Preview</IonTitle>
        </IonToolbar>
      </AppHeader>
      <IonContent className="ion-padding">{content}</IonContent>
    </IonPage>
  );
}
