import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import Markdown from "../../Markdown";
import CommentMarkdown from "../../../comment/CommentMarkdown";

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
  const content = (() => {
    switch (type) {
      case "comment":
        return <CommentMarkdown>{text}</CommentMarkdown>;
      case "post":
        return <Markdown>{text}</Markdown>;
    }
  })();

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="end">
            <IonButton color="primary" strong onClick={() => onDismiss()}>
              Done
            </IonButton>
          </IonButtons>
          <IonTitle>Preview</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">{content}</IonContent>
    </IonPage>
  );
}
