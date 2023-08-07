import styled from "@emotion/styled";
import bold from "./icons/bold.svg";
import italic from "./icons/italic.svg";
import {
  IonIcon,
  IonLoading,
  useIonActionSheet,
  useIonModal,
  useIonToast,
} from "@ionic/react";
import {
  ellipsisHorizontal,
  glassesOutline,
  image,
  link,
} from "ionicons/icons";
import "@github/markdown-toolbar-element";
import useKeyboardHeight from "../../../../helpers/useKeyboardHeight";
import PreviewModal from "./PreviewModal";
import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { css } from "@emotion/react";
import { uploadImage } from "../../../../services/lemmy";
import { useAppSelector } from "../../../../store";
import { jwtSelector, urlSelector } from "../../../auth/authSlice";
import { insert } from "../../../../helpers/string";

export const TOOLBAR_TARGET_ID = "toolbar-target";
export const TOOLBAR_HEIGHT = "50px";

const ToolbarContainer = styled.div`
  height: 100%;
  width: 100%;

  pointer-events: none;
`;

const Toolbar = styled.div<{ keyboardHeight: number }>`
  pointer-events: all;

  position: absolute;
  bottom: 0;

  height: ${TOOLBAR_HEIGHT};

  @media screen and (max-width: 767px) {
    height: ${({ keyboardHeight }) =>
      !keyboardHeight
        ? `calc(${TOOLBAR_HEIGHT} + env(safe-area-inset-bottom))`
        : TOOLBAR_HEIGHT};
    padding-bottom: ${({ keyboardHeight }) =>
      !keyboardHeight ? "env(safe-area-inset-bottom)" : 0};
  }

  width: 100%;
  border-top: 1px solid var(--ion-item-border-color);

  ${({ theme }) =>
    theme.dark
      ? css`
          background: var(--ion-background-color);
        `
      : css`
          background: var(--ion-item-background, #fff);
        `}

  markdown-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-evenly;

    height: 100%;
  }
`;

const Button = styled.button`
  padding: 1rem;
  font-size: 1.5rem;

  appearance: none;
  background: none;
  border: 0;
`;

interface MarkdownToolbarProps {
  type: "comment" | "post";
  text: string;
  setText: Dispatch<SetStateAction<string>>;
  textareaRef: RefObject<HTMLTextAreaElement>;
  slot?: string;
}

export default function MarkdownToolbar({
  type,
  text,
  setText,
  textareaRef,
  slot,
}: MarkdownToolbarProps) {
  const [presentActionSheet] = useIonActionSheet();
  const [presentAlert] = useIonToast();
  const keyboardHeight = useKeyboardHeight();
  const [imageUploading, setImageUploading] = useState(false);
  const jwt = useAppSelector(jwtSelector);
  const instanceUrl = useAppSelector(urlSelector);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const [presentPreview, onDismissPreview] = useIonModal(PreviewModal, {
    onDismiss: (data: string, role: string) => onDismissPreview(data, role),
    type,
    text,
  });
  const selectionLocation = useRef(0);

  useEffect(() => {
    const onChange = () => {
      selectionLocation.current = textareaRef.current?.selectionStart ?? 0;
    };

    document.addEventListener("selectionchange", onChange);

    return () => {
      document.removeEventListener("selectionchange", onChange);
    };
  }, [textareaRef]);

  function presentMoreOptions() {
    presentActionSheet({
      cssClass: "left-align-buttons",
      buttons: [
        {
          text: "Preview",
          icon: glassesOutline,
          handler: presentPreview,
        },
        {
          text: "Cancel",
          role: "cancel",
        },
      ],
    });
  }

  async function receivedImage(image: File) {
    if (!jwt) return;

    setImageUploading(true);

    let imageUrl: string;

    try {
      imageUrl = await uploadImage(instanceUrl, jwt, image);
    } catch (error) {
      presentAlert({
        message: "Problem uploading image. Please try again.",
        duration: 3500,
        position: "bottom",
        color: "danger",
      });

      throw error;
    } finally {
      setImageUploading(false);
    }

    if (!textareaRef.current) return;

    setText((text) =>
      insert(text, selectionLocation.current, `\n![](${imageUrl})\n`)
    );
  }

  return (
    <>
      <IonLoading isOpen={imageUploading} message="Uploading image..." />

      <ToolbarContainer className="fixed-toolbar-container" slot={slot}>
        <Toolbar keyboardHeight={keyboardHeight} ref={toolbarRef}>
          <markdown-toolbar for={TOOLBAR_TARGET_ID}>
            <label htmlFor="photo-upload">
              <Button as="div" onClick={() => textareaRef.current?.focus()}>
                <IonIcon icon={image} color="primary" />
              </Button>

              <input
                css={css`
                  display: none;
                `}
                type="file"
                accept="image/jpeg, image/x-png, image/gif"
                id="photo-upload"
                onInput={(e) => {
                  const image = (e.target as HTMLInputElement).files?.[0];
                  if (!image) return;

                  receivedImage(image);
                }}
              />
            </label>
            <md-link>
              <Button>
                <IonIcon icon={link} color="primary" />
              </Button>
            </md-link>
            <md-bold>
              <Button>
                <IonIcon icon={bold} color="primary" />
              </Button>
            </md-bold>
            <md-italic>
              <Button>
                <IonIcon icon={italic} color="primary" />
              </Button>
            </md-italic>
            <Button onClick={presentMoreOptions}>
              <IonIcon
                icon={ellipsisHorizontal}
                color="primary"
                onClick={(e) => e.preventDefault()}
              />
            </Button>
          </markdown-toolbar>
        </Toolbar>
      </ToolbarContainer>
    </>
  );
}
