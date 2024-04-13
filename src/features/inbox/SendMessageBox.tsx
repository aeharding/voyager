import { styled } from "@linaria/react";
import { MaxWidthContainer } from "../shared/AppContent";
import TextareaAutosize from "react-textarea-autosize";
import { IonIcon } from "@ionic/react";
import { KeyboardEvent, useCallback, useState } from "react";
import useClient from "../../helpers/useClient";
import useAppToast from "../../helpers/useAppToast";
import { receivedMessages } from "./inboxSlice";
import { useAppDispatch } from "../../store";
import { arrowUp } from "ionicons/icons";

const MaxSizeContainer = styled(MaxWidthContainer)`
  height: 100%;
`;

const SendContainer = styled.div`
  position: relative;

  padding: 0.5rem;

  background: var(
    --ion-tab-bar-background,
    var(--ion-background-color-step-50, #f7f7f7)
  );
  border-top: 1px solid
    var(
      --ion-tab-bar-border-color,
      var(
        --ion-border-color,
        var(--ion-background-color-step-150, rgba(0, 0, 0, 0.2))
      )
    );
`;

const InputContainer = styled.div`
  position: relative;

  display: flex;
`;

const Input = styled(TextareaAutosize)`
  border: 1px solid var(--ion-color-medium);
  border-radius: 1rem;

  // Exact px measurements to prevent
  // pixel rounding browser inconsistencies
  padding: 8px 1rem;
  line-height: 18px;
  font-size: 16px;

  background: var(--ion-background-color);
  color: var(--ion-text-color);
  outline: none;

  width: 100%;
  resize: none;
  appearance: none;
`;

const SendButton = styled(IonIcon)`
  position: absolute;
  bottom: calc(36px / 2);
  transform: translateY(50%);
  right: 4px;
  background: var(--ion-color-primary);
  height: 21px;
  width: 21px;
  border-radius: 50%;
  padding: 3px;
  color: white;
`;

interface SendMessageBoxProps {
  recipientId: number;
}

export default function SendMessageBox({ recipientId }: SendMessageBoxProps) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");
  const client = useClient();
  const presentToast = useAppToast();

  const send = useCallback(async () => {
    setLoading(true);

    let message;

    try {
      message = await client.createPrivateMessage({
        content: value,
        recipient_id: recipientId,
      });
    } catch (error) {
      presentToast({
        message: `Message failed to send. Please try again`,
        color: "danger",
      });
      setLoading(false);
      throw error;
    }

    dispatch(receivedMessages([message.private_message_view]));

    setLoading(false);
    setValue("");
  }, [client, dispatch, presentToast, recipientId, value]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (!e.ctrlKey && !e.metaKey) return;
      if (e.key !== "Enter") return;

      send();
    },
    [send],
  );

  return (
    <SendContainer>
      <MaxSizeContainer>
        <InputContainer>
          <Input
            disabled={loading}
            placeholder="Message"
            onChange={(e) => setValue(e.target.value)}
            value={value}
            rows={1}
            maxRows={5}
            onKeyDown={onKeyDown}
          />
          {value.trim() && !loading && (
            <SendButton icon={arrowUp} onClick={send} />
          )}
        </InputContainer>
      </MaxSizeContainer>
    </SendContainer>
  );
}
