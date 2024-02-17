import {
  IonIcon,
  IonLoading,
  useIonActionSheet,
  useIonModal,
} from "@ionic/react";
import useAppToast from "../../../../../helpers/useAppToast";
import {
  ellipsisHorizontal,
  glassesOutline,
  happyOutline,
  image,
  link,
  peopleOutline,
  personOutline,
} from "ionicons/icons";
import {
  Dispatch,
  MouseEvent,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAppSelector } from "../../../../../store";
import { jwtSelector, urlSelector } from "../../../../auth/authSelectors";
import PreviewModal from "../PreviewModal";
import { uploadImage } from "../../../../../services/lemmy";
import { insert } from "../../../../../helpers/string";
import textFaces from "./textFaces.txt?raw";
import { bold, italic, quote } from "../../../../icons";
import { TOOLBAR_TARGET_ID } from "../MarkdownToolbar";
import { styled } from "@linaria/react";
import { css } from "@linaria/core";

const Button = styled.button`
  padding: 0;
  font-size: 1.5rem;

  appearance: none;
  background: none;
  border: 0;
`;

export interface SharedModeProps {
  type: "comment" | "post";
  text: string;
  setText: Dispatch<SetStateAction<string>>;
  textareaRef: RefObject<HTMLTextAreaElement>;
}

interface DefaultModeProps extends SharedModeProps {
  calculateMode: () => void;
}

export default function DefaultMode({
  type,
  text,
  setText,
  textareaRef,
  calculateMode,
}: DefaultModeProps) {
  const [presentActionSheet] = useIonActionSheet();
  const [presentTextFaceActionSheet] = useIonActionSheet();
  const presentToast = useAppToast();
  const jwt = useAppSelector(jwtSelector);
  const instanceUrl = useAppSelector(urlSelector);

  const [presentPreview, onDismissPreview] = useIonModal(PreviewModal, {
    onDismiss: (data?: string, role?: string) => onDismissPreview(data, role),
    type,
    text,
  });

  const [imageUploading, setImageUploading] = useState(false);

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
          text: "Mention user",
          icon: personOutline,
          handler: () => {
            insertAutocomplete("@");
          },
        },
        {
          text: "Link a community",
          icon: peopleOutline,
          handler: () => {
            insertAutocomplete("!");
          },
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

  function insertAutocomplete(prefix: "@" | "!") {
    const index = selectionLocation.current;

    // Test previous character to see if separator needed
    const needsSpace = !/^$|\s|\(|\[/.test(text[index - 1] || "");
    const space = needsSpace ? " " : "";

    const toInsert = `${space}${prefix}`;

    setText((text) => insert(text, index, toInsert));

    textareaRef.current?.focus();

    setTimeout(() => {
      const location = index + toInsert.length;

      textareaRef.current?.setSelectionRange(location, location);

      calculateMode();
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

        if (textareaRef.current) {
          textareaRef.current.focus();

          setTimeout(() => {
            textareaRef.current?.setSelectionRange(
              currentSelectionLocation,
              currentSelectionLocation,
            );
          });
        }
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

    if (textareaRef.current) {
      textareaRef.current.focus();

      setTimeout(() => {
        if (!textareaRef.current) return;

        textareaRef.current.selectionEnd =
          currentSelectionLocation + insertedText.length;
      }, 10);
    }

    return false;
  }

  return (
    <>
      <IonLoading isOpen={imageUploading} message="Uploading image..." />

      <markdown-toolbar for={TOOLBAR_TARGET_ID}>
        <label htmlFor="photo-upload">
          <Button as="div" onClick={() => textareaRef.current?.focus()}>
            <IonIcon icon={image} color="primary" />
          </Button>

          <input
            className={css`
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
        <md-quote>
          <Button onClickCapture={onQuote}>
            <IonIcon icon={quote} color="primary" />
          </Button>
        </md-quote>
        <Button onClick={presentMoreOptions}>
          <IonIcon icon={ellipsisHorizontal} color="primary" />
        </Button>
      </markdown-toolbar>
    </>
  );
}

// Rudimentary parsing to remove recurring back slashes for display
function formatTextFace(input: string): string {
  return input.replace(/(?:\\(.))/g, "$1");
}
