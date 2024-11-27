import { IonButton, IonIcon } from "@ionic/react";
import { resize, send as sendIcon } from "ionicons/icons";
import { Person } from "lemmy-js-client";
import { KeyboardEvent, useContext, useEffect, useRef, useState } from "react";
import TextareaAutosize, {
  TextareaAutosizeProps,
} from "react-textarea-autosize";

import { PageContext } from "#/features/auth/PageContext";
import { MaxWidthContainer } from "#/features/shared/AppContent";
import { privateMessageSendFailed } from "#/helpers/toastMessages";
import useAppToast from "#/helpers/useAppToast";
import useClient from "#/helpers/useClient";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import { useAppDispatch } from "#/store";

import { receivedMessages } from "./inboxSlice";

import styles from "./SendMessageBox.module.css";

interface SendMessageBoxProps {
  recipient: Person;
  onHeightChange?: TextareaAutosizeProps["onHeightChange"];
  scrollToBottom?: () => void;
}

export default function SendMessageBox({
  recipient,
  onHeightChange,
  scrollToBottom,
}: SendMessageBoxProps) {
  const router = useOptimizedIonRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");
  const client = useClient();
  const presentToast = useAppToast();
  const { presentPrivateMessageCompose } = useContext(PageContext);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  async function send() {
    setLoading(true);

    let message;

    try {
      message = await client.createPrivateMessage({
        content: value,
        recipient_id: recipient.id,
      });
    } catch (error) {
      presentToast(privateMessageSendFailed);
      setLoading(false);
      throw error;
    }

    dispatch(receivedMessages([message.private_message_view]));

    setLoading(false);
    setValue("");

    scrollToBottom?.();
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (!e.ctrlKey && !e.metaKey) return;
    if (e.key !== "Enter") return;

    send();
  }

  useEffect(() => {
    const search = Object.fromEntries([
      ...new URLSearchParams(router.getRouteInfo()?.search),
    ]);

    // only focus input if user intends to send a message
    if (search.intent !== "send") return;

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [router]);

  return (
    <div className={styles.sendContainer}>
      <MaxWidthContainer className={styles.maxSizeContainer}>
        <div className={styles.inputContainer}>
          <IonButton
            className={styles.iconButton}
            shape="round"
            fill="clear"
            onClick={async () => {
              const message = await presentPrivateMessageCompose({
                private_message: { recipient },
                value,
              });

              if (!message) return;

              scrollToBottom?.();
              setValue("");
            }}
            aria-label="Open fullsize editor"
          >
            <IonIcon
              icon={resize}
              slot="icon-only"
              className={styles.resizeIcon}
            />
          </IonButton>
          <TextareaAutosize
            className={styles.input}
            ref={inputRef}
            disabled={loading}
            placeholder="Message"
            onChange={(e) => setValue(e.target.value)}
            value={value}
            rows={1}
            maxRows={5}
            onKeyDown={onKeyDown}
            onHeightChange={onHeightChange}
            onFocus={(e) => {
              e.stopPropagation();
            }}
          />
          <IonButton
            className={styles.iconButton}
            disabled={!value.trim() || loading}
            shape="round"
            fill="clear"
            onClick={send}
            aria-label="Send message"
          >
            <IonIcon
              icon={sendIcon}
              slot="icon-only"
              className={styles.sendIcon}
            />
          </IonButton>
        </div>
      </MaxWidthContainer>
    </div>
  );
}
