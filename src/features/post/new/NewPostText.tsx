import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonIcon,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Centered, Spinner } from "../../auth/login/LoginNav";
import AppHeader from "../../shared/AppHeader";
import Editor from "../../shared/markdown/editing/Editor";
import { MarkdownEditorIonContent } from "../../shared/markdown/editing/MarkdownToolbar";
import { isIosTheme } from "../../../helpers/device";
import { send } from "ionicons/icons";

interface NewPostTextProps {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  onSubmit: () => void;
  editing: boolean;
  dismiss: () => void;
}

export default function NewPostText({
  value,
  setValue,
  onSubmit,
  editing,
  dismiss,
}: NewPostTextProps) {
  const [loading, setLoading] = useState(false);

  const [text, setText] = useState(value);
  const isSubmitDisabled = loading;

  useEffect(() => {
    setValue(text);
  }, [setValue, text]);

  async function submit() {
    if (isSubmitDisabled) return;
    setLoading(true);

    try {
      await onSubmit();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton disabled={loading} />
          </IonButtons>
          <IonTitle>
            <Centered>
              <IonText>Post Text</IonText>
              {loading && <Spinner color="dark" />}
            </Centered>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              strong
              type="submit"
              onClick={submit}
              disabled={isSubmitDisabled}
            >
              {isIosTheme() ? "Post" : <IonIcon icon={send} slot="icon-only" />}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </AppHeader>
      <MarkdownEditorIonContent>
        <Editor
          text={text}
          setText={setText}
          canRecoverText={!editing}
          onSubmit={submit}
          onDismiss={dismiss}
        />
      </MarkdownEditorIonContent>
    </>
  );
}
