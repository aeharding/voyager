import {
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonModal,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { copyOutline } from "ionicons/icons";
import { FormEvent, useMemo, useRef } from "react";

import { decorateMarkdown } from "#/features/shared/markdown/editing/rich/markdownDecorator";
import { cx } from "#/helpers/css";
import { preventModalSwipeOnTextSelection } from "#/helpers/ionic";
import {
  copyClipboardFailed,
  copyClipboardSuccess,
} from "#/helpers/toastMessages";
import useAppToast from "#/helpers/useAppToast";

import AppHeader from "./AppHeader";

import decoratorStyles from "./markdown/editing/rich/markdownDecorator.module.css";
import styles from "./SelectTextModal.module.css";

interface SelectTextProps {
  text: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

// Not isTouchDevice(): some desktops report touch capability with no
// touchscreen (e.g. Firefox on Linux). The contenteditable branch is wanted
// wherever focusing it can't pop an on-screen keyboard, so key on the
// primary pointer instead.
const desktopPointer = window.matchMedia(
  "(hover: hover) and (pointer: fine)",
).matches;

export default function SelectTextModal({
  text,
  isOpen,
  setIsOpen,
}: SelectTextProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const firstSelectRef = useRef(true);
  const presentToast = useAppToast();

  const rendered = useMemo(() => {
    try {
      return decorateMarkdown(text);
    } catch {
      // Never let a decoration error break text selection — fall back to plain
      return text;
    }
  }, [text]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      presentToast(copyClipboardFailed);
      throw error;
    }

    presentToast(copyClipboardSuccess);
  }

  function preventDefault(e: FormEvent | React.ClipboardEvent) {
    e.preventDefault();
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
            <IonButton aria-label="Copy" onClick={copy}>
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
        <div className={styles.container}>
          {desktopPointer ? (
            // Read-only contenteditable (same approach as the rich editor) so
            // desktop gets a native caret + ctrl+A scoped to the text
            <div
              ref={contentRef}
              className={cx(styles.editable, decoratorStyles.decorated)}
              contentEditable
              suppressContentEditableWarning
              onBeforeInput={preventDefault}
              onPaste={preventDefault}
              onCut={preventDefault}
              onDropCapture={preventDefault}
              onMouseMove={(e) => e.stopPropagation()}
              onClick={() => {
                if (
                  !firstSelectRef.current ||
                  window.getSelection()?.toString()
                )
                  return;

                if (!contentRef.current) return;

                firstSelectRef.current = false;
                contentRef.current.focus();
                window.getSelection()?.selectAllChildren(contentRef.current);
              }}
            >
              {rendered}
            </div>
          ) : (
            <div
              {...preventModalSwipeOnTextSelection}
              className={cx(styles.selectable, decoratorStyles.decorated)}
            >
              {rendered}
            </div>
          )}
        </div>
      </IonContent>
    </IonModal>
  );
}
