import {
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonModal,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { styled } from "@linaria/react";
import { copyOutline } from "ionicons/icons";
import { useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";

import { isTouchDevice } from "#/helpers/device";
import { preventModalSwipeOnTextSelection } from "#/helpers/ionic";
import {
  copyClipboardFailed,
  copyClipboardSuccess,
} from "#/helpers/toastMessages";
import useAppToast from "#/helpers/useAppToast";

import AppHeader from "./AppHeader";

const Container = styled.div`
  min-height: 100%;

  display: flex;

  html.ios:not(.ion-palette-dark) & {
    background: var(--ion-item-background);
  }
`;

const sharedSelectStyles = `
  padding: 8px;
  width: calc(100% - 16px);

  user-select: text;

  margin-bottom: var(--ion-safe-area-bottom, env(safe-area-inset-bottom));
`;

const InvisibleTextarea = styled(TextareaAutosize)`
  all: unset;
  white-space: pre-wrap;
  width: 100%;

  ${sharedSelectStyles}
`;

const Selectable = styled.div`
  user-select: text;
  white-space: pre-wrap;

  ${sharedSelectStyles}
`;

interface SelectTextProps {
  text: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const touch = isTouchDevice();

export default function SelectTextModal({
  text,
  isOpen,
  setIsOpen,
}: SelectTextProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const firstSelectRef = useRef(true);
  const presentToast = useAppToast();

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      presentToast(copyClipboardFailed);
      throw error;
    }

    presentToast(copyClipboardSuccess);
  }

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={() => {
        firstSelectRef.current = false;
        setIsOpen(false);
      }}
      initialBreakpoint={0.5}
      breakpoints={[0, 0.5, 1]}
      autoFocus
    >
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={copy}>
              <IonIcon icon={copyOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>Select Text</IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Dismiss
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </AppHeader>
      <IonContent>
        <Container>
          {touch ? (
            <Selectable {...preventModalSwipeOnTextSelection}>
              {text}
            </Selectable>
          ) : (
            <InvisibleTextarea
              ref={textareaRef}
              onMouseMove={(e) => e.stopPropagation()}
              onClick={() => {
                if (
                  !firstSelectRef.current ||
                  window.getSelection()?.toString()
                )
                  return true;

                if (!(textareaRef.current instanceof HTMLTextAreaElement))
                  return true;

                firstSelectRef.current = false;
                textareaRef.current.focus();
                textareaRef.current.select();
              }}
              readOnly
              value={text}
            />
          )}
        </Container>
      </IonContent>
    </IonModal>
  );
}
