import {
  ActionSheetButton,
  IonActionSheet,
  IonItem,
  IonLabel,
} from "@ionic/react";
import { useState } from "react";

export type PostContent = "full" | "hide-body" | "title-only";

const LABELS: Record<PostContent, string> = {
  full: "Expanded",
  "hide-body": "Hide Body",
  "title-only": "Title Only",
};

interface PostContentSelectorProps {
  value: PostContent;
  onChange: (value: PostContent) => void;
  canHideBody: boolean;
}

export default function PostContentSelector({
  value,
  onChange,
  canHideBody,
}: PostContentSelectorProps) {
  const [open, setOpen] = useState(false);

  const options: PostContent[] = [
    "title-only",
    "full",
    ...(canHideBody ? (["hide-body"] as const) : []),
  ];

  const buttons: ActionSheetButton<PostContent>[] = options.map((o) => ({
    text: LABELS[o],
    data: o,
    role: value === o ? "selected" : undefined,
  }));

  return (
    <IonItem button detail={false} onClick={() => setOpen(true)}>
      <IonLabel>Post Content</IonLabel>
      <IonLabel slot="end" color="medium" className="ion-no-margin">
        {LABELS[value]}
      </IonLabel>
      <IonActionSheet
        cssClass="left-align-buttons"
        isOpen={open}
        onDidDismiss={() => setOpen(false)}
        onWillDismiss={(e) => {
          if (!e.detail.data) return;
          onChange(e.detail.data);
        }}
        header="Post Content"
        buttons={buttons}
      />
    </IonItem>
  );
}
