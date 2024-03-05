import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Centered, Spinner } from "../../auth/login/LoginNav";
import { clearRecoveredText } from "../../../helpers/useTextRecovery";
import AppHeader from "../../shared/AppHeader";
import Editor from "../../shared/markdown/editing/Editor";

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

    clearRecoveredText();
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
              Post
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </AppHeader>
      <IonContent>
        <Editor
          text={text}
          setText={setText}
          canRecoverText={!editing}
          onSubmit={submit}
          onDismiss={dismiss}
        />
      </IonContent>
    </>
  );
}
