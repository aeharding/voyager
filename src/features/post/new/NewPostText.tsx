import styled from "@emotion/styled";
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Centered, Spinner } from "../../auth/Login";
import { css } from "@emotion/react";
import TextareaAutosizedForOnScreenKeyboard from "../../shared/TextareaAutosizedForOnScreenKeyboard";
import useKeyboardHeight from "../../../helpers/useKeyboardHeight";
import MarkdownToolbar, {
  TOOLBAR_HEIGHT,
  TOOLBAR_TARGET_ID,
} from "../../shared/markdown/editing/MarkdownToolbar";

const Container = styled.div<{ keyboardHeight: number }>`
  min-height: 100%;

  display: flex;
  flex-direction: column;

  padding-bottom: ${({ keyboardHeight }) =>
    keyboardHeight
      ? TOOLBAR_HEIGHT
      : `calc(${TOOLBAR_HEIGHT} + env(safe-area-inset-bottom))`};
`;

const Textarea = styled(TextareaAutosizedForOnScreenKeyboard)`
  border: 0;
  background: none;
  resize: none;
  outline: 0;
  padding: 1rem;

  flex: 1 0 auto;
  min-height: 7rem;

  ${({ theme }) =>
    !theme.dark &&
    css`
      .ios & {
        background: var(--ion-item-background);
      }
    `}
`;

interface NewPostTextProps {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  onSubmit: () => void;
}

export default function NewPostText({
  value,
  setValue,
  onSubmit,
}: NewPostTextProps) {
  const [loading, setLoading] = useState(false);

  const keyboardHeight = useKeyboardHeight();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [text, setText] = useState(value);

  useEffect(() => {
    setValue(text);
  }, [setValue, text]);

  async function submit() {
    setLoading(true);

    try {
      await onSubmit();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <IonHeader>
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
            <IonButton strong type="submit" onClick={submit} disabled={loading}>
              Post
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <Container keyboardHeight={keyboardHeight}>
          <Textarea
            id={TOOLBAR_TARGET_ID}
            ref={textareaRef}
            value={text}
            onInput={(e) => setText((e.target as HTMLInputElement).value)}
            autoFocus
          />
        </Container>

        <MarkdownToolbar
          slot="fixed"
          type="post"
          text={text}
          setText={setText}
          textareaRef={textareaRef}
        />
      </IonContent>
    </>
  );
}
