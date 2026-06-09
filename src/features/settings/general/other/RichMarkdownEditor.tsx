import { IonItem, IonToggle } from "@ionic/react";

import { setRichMarkdownEditor } from "#/features/settings/settingsSlice";
import { useAppDispatch, useAppSelector } from "#/store";

export default function RichMarkdownEditor() {
  const dispatch = useAppDispatch();
  const richMarkdownEditor = useAppSelector(
    (state) => state.settings.general.richMarkdownEditor,
  );

  return (
    <IonItem>
      <IonToggle
        checked={richMarkdownEditor}
        onIonChange={(e) => dispatch(setRichMarkdownEditor(e.detail.checked))}
      >
        Rich Markdown Editor
      </IonToggle>
    </IonItem>
  );
}
