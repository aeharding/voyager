import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonModal,
} from "@ionic/react";
import { Centered } from "../auth/login/LoginNav";
import TextareaAutosize from "react-textarea-autosize";
import { useRef } from "react";
import { isTouchDevice } from "../../helpers/device";
import { preventModalSwipeOnTextSelection } from "../../helpers/ionic";
import { styled } from "@linaria/react";

const Container = styled.div`
  min-height: 100%;

  display: flex;

  html.ios:not(.theme-dark) & {
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
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <Centered>Select Text</Centered>
          </IonTitle>
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
      </IonHeader>
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
