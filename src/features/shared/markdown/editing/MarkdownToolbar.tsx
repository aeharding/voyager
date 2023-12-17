import styled from "@emotion/styled";
import {
  IonIcon,
  IonLoading,
  useIonActionSheet,
  useIonAlert,
  useIonModal,
} from "@ionic/react";
import {
  ellipsisHorizontal,
  glassesOutline,
  happyOutline,
  image,
  link,
} from "ionicons/icons";
import "@github/markdown-toolbar-element";
import PreviewModal from "./PreviewModal";
import {
  Dispatch,
  MouseEvent,
  RefObject,
  SetStateAction,
  TouchEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { css } from "@emotion/react";
import { uploadImage } from "../../../../services/lemmy";
import { useAppSelector } from "../../../../store";
import { jwtSelector, urlSelector } from "../../../auth/authSlice";
import { insert } from "../../../../helpers/string";
import useKeyboardOpen from "../../../../helpers/useKeyboardOpen";
import textFaces from "./textFaces.txt?raw";
import useAppToast from "../../../../helpers/useAppToast";
import { bold, italic, quote } from "../../../icons";

export const TOOLBAR_TARGET_ID = "toolbar-target";
export const TOOLBAR_HEIGHT = "50px";

const ToolbarContainer = styled.div`
  height: 100%;
  width: 100%;

  pointer-events: none;
`;

const Toolbar = styled.div<{ keyboardOpen: boolean }>`
  pointer-events: all;

  position: absolute;
  bottom: 0;

  height: ${TOOLBAR_HEIGHT};

  @media screen and (max-width: 767px) {
    height: ${({ keyboardOpen }) =>
      !keyboardOpen
        ? `calc(${TOOLBAR_HEIGHT} + var(--ion-safe-area-bottom, env(safe-area-inset-bottom)))`
        : TOOLBAR_HEIGHT};
    padding-bottom: ${({ keyboardOpen }) =>
      !keyboardOpen
        ? "var(--ion-safe-area-bottom, env(safe-area-inset-bottom))"
        : 0};
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
  const [presentAlert] = useIonAlert();
  const [presentActionSheet] = useIonActionSheet();
  const [presentTextFaceActionSheet] = useIonActionSheet();
  const presentToast = useAppToast();
  const keyboardOpen = useKeyboardOpen();
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
  const replySelectionRef = useRef("");

  useEffect(() => {
    const onChange = () => {
      selectionLocation.current = textareaRef.current?.selectionStart ?? 0;
      replySelectionRef.current = window.getSelection()?.toString() || "";
    };

    document.addEventListener("selectionchange", onChange);

    return () => {
      document.removeEventListener("selectionchange", onChange);
    };
  }, [textareaRef]);

  function presentMoreOptions(e: MouseEvent) {
    e.preventDefault();

    presentActionSheet({
      cssClass: "left-align-buttons",
      buttons: [
        {
          text: "Preview",
          icon: glassesOutline,
          handler: presentPreview,
        },
        {
          text: "Text Faces",
          icon: happyOutline,
          handler: presentTextFaces,
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
      const message = error instanceof Error ? error.message : "Unknown error";

      presentToast({
        message: `Problem uploading image: ${message}. Please try again.`,
        color: "danger",
        fullscreen: true,
      });

      throw error;
    } finally {
      setImageUploading(false);
    }

    if (!textareaRef.current) return;

    setText((text) =>
      insert(text, selectionLocation.current, `\n![](${imageUrl})\n`),
    );
  }

  function presentLinkInput(e: MouseEvent) {
    e.preventDefault();

    presentAlert({
      header: "Insert link",
      inputs: [
        {
          name: "text",
          placeholder: "Description",
        },
        {
          name: "url",
          placeholder: "https://vger.app",
        },
      ],
      buttons: [
        {
          text: "OK",
          handler: ({ text, url }) => {
            const markdownLink = `[${text}](${url || "url"})`;
            const currentSelectionLocation =
              selectionLocation.current + text.length === 0
                ? 1
                : markdownLink.length;

            setText((text) =>
              insert(text, selectionLocation.current, markdownLink),
            );

            setSelectionEnd(currentSelectionLocation);
          },
        },
        "Cancel",
      ],
    });
  }

  function presentTextFaces() {
    presentTextFaceActionSheet({
      cssClass: "left-align-buttons action-sheet-height-fix",
      keyboardClose: false,
      buttons: [
        ...textFaces.split("\n").map((face) => ({
          text: formatTextFace(face),
          data: face,
        })),
        {
          text: "Cancel",
          role: "cancel",
        },
      ],
      onWillDismiss: (event) => {
        if (!event.detail.data) return;

        const currentSelectionLocation =
          selectionLocation.current + event.detail.data.length;

        setText((text) =>
          insert(text, selectionLocation.current, event.detail.data),
        );

        setSelectionEnd(currentSelectionLocation);
      },
    });
  }

  function onQuote(e: MouseEvent | TouchEvent) {
    if (!replySelectionRef.current) return;
    if (
      !textareaRef.current ||
      textareaRef.current?.selectionStart - textareaRef.current?.selectionEnd
    )
      return;

    e.stopPropagation();
    e.preventDefault();

    const currentSelectionLocation = selectionLocation.current;

    let insertedText = `> ${replySelectionRef.current
      .trim()
      .split("\n")
      .join("\n> ")}\n\n`;

    if (
      text[currentSelectionLocation - 2] &&
      text[currentSelectionLocation - 2] !== "\n"
    ) {
      insertedText = `\n${insertedText}`;
    }

    setText((text) => insert(text, currentSelectionLocation, insertedText));

    setSelectionEnd(currentSelectionLocation + insertedText.length);

    return false;
  }

  function setSelectionEnd(newLocation: number) {
    if (textareaRef.current) {
      textareaRef.current.focus();

      setTimeout(() => {
        if (!textareaRef.current) return;

        textareaRef.current.selectionEnd = newLocation;
      }, 10);
    }
  }

  return (
    <>
      <IonLoading isOpen={imageUploading} message="Uploading image..." />

      <ToolbarContainer className="fixed-toolbar-container" slot={slot}>
        <Toolbar keyboardOpen={keyboardOpen} ref={toolbarRef}>
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
                accept="image/*"
                id="photo-upload"
                onInput={(e) => {
                  const image = (e.target as HTMLInputElement).files?.[0];
                  if (!image) return;

                  receivedImage(image);
                }}
              />
            </label>
            <Button onClick={presentLinkInput}>
              <IonIcon icon={link} color="primary" />
            </Button>
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
            <md-quote>
              <Button onClickCapture={onQuote}>
                <IonIcon icon={quote} color="primary" />
              </Button>
            </md-quote>
            <Button onClick={presentMoreOptions}>
              <IonIcon icon={ellipsisHorizontal} color="primary" />
            </Button>
          </markdown-toolbar>
        </Toolbar>
      </ToolbarContainer>
    </>
  );
}

// Rudimentary parsing to remove recurring back slashes for display
function formatTextFace(input: string): string {
  return input.replace(/(?:\\(.))/g, "$1");
}
