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
import { useState } from "react";
import { Centered, Spinner } from "../../auth/Login";
import { css } from "@emotion/react";

const Container = styled.div`
  position: absolute;
  inset: 0;

  display: flex;
  flex-direction: column;
`;

const Textarea = styled.textarea`
  border: 0;
  background: none;
  resize: none;
  outline: 0;
  padding: 1rem;

  flex: 1 0 0;
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
  setValue: (value: string) => void;
  onSubmit: () => void;
}

export default function NewPostText({
  value,
  setValue,
  onSubmit,
}: NewPostTextProps) {
  const [loading, setLoading] = useState(false);

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
        <Container>
          <Textarea
            defaultValue={value}
            onInput={(e) => setValue((e.target as HTMLInputElement).value)}
            autoFocus
          />
        </Container>
      </IonContent>
    </>
  );
}
