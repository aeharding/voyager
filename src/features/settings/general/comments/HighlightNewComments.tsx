import { IonItem, IonToggle, useIonAlert } from "@ionic/react";

import { useMode } from "#/helpers/threadiverse";
import { useAppDispatch, useAppSelector } from "#/store";

import { setHighlightNewComments } from "../../settingsSlice";

export default function HighlightNewComments() {
  const dispatch = useAppDispatch();
  const [presentAlert] = useIonAlert();
  const { highlightNewComments } = useAppSelector(
    (state) => state.settings.general.comments,
  );
  const mode = useMode();

  return (
    <IonItem>
      <IonToggle
        checked={highlightNewComments}
        onIonChange={(e) => {
          if (e.detail.checked) {
            const message = (() => {
              switch (mode) {
                case "lemmyv0":
                  return "Your instance only supports the “X new” comments count. Highlighting new comments requires Lemmy v1.";
                case "piefed":
                  return "PieFed does not support new comment tracking, so this setting has no effect on your instance.";
                case "lemmyv1":
                case undefined:
                  return undefined;
              }
            })();

            if (message) {
              presentAlert({
                header: "Just FYI...",
                message,
                buttons: ["OK"],
              });
            }
          }

          dispatch(setHighlightNewComments(e.detail.checked));
        }}
      >
        New Comments Highlightifier
      </IonToggle>
    </IonItem>
  );
}
