import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import Markdown from "../Markdown";
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
    // disableInternalLinkRouting to prevent internal links (like @test@example.com)
    // from taking user away from current page (since user is in a modal)
    //
    // TODO future - push internal routes onto the `ion-nav`? might be cool!
    switch (type) {
      case "comment":
        return (
          <CommentMarkdown disableInternalLinkRouting>{text}</CommentMarkdown>
        );
      case "post":
        return <Markdown disableInternalLinkRouting>{text}</Markdown>;
    }
  })();

  return (
    <IonPage>
      <IonHeader>
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
