import {
  IonIcon,
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
} from "react";
import PreviewModal from "../PreviewModal";
import { insert } from "../../../../../helpers/string";
import textFaces from "./textFaces.txt?raw";
import { bold, italic, quote } from "../../../../icons";
import { TOOLBAR_TARGET_ID } from "../MarkdownToolbar";
import { styled } from "@linaria/react";
import { css } from "@linaria/core";
import { isValidUrl } from "../../../../../helpers/url";
import useUploadImage from "../useUploadImage";

const Button = styled.button`
  padding: 0;
  font-size: 1.5rem;

  appearance: none;
  background: none;
  border: 0;

  display: flex;
  align-items: center;
  justify-content: center;
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
  const [presentAlert] = useIonAlert();
  const [presentTextFaceActionSheet] = useIonActionSheet();

  const [presentPreview, onDismissPreview] = useIonModal(PreviewModal, {
    onDismiss: (data?: string, role?: string) => onDismissPreview(data, role),
    type,
    text,
  });

  const { uploadImage, jsx } = useUploadImage();

  const selectionLocation = useRef(0);
  const selectionLocationEnd = useRef(0);
  const replySelectionRef = useRef("");

  useEffect(() => {
    const onChange = () => {
      selectionLocation.current = textareaRef.current?.selectionStart ?? 0;
      selectionLocationEnd.current = textareaRef.current?.selectionEnd ?? 0;
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

  function presentLinkInput() {
    const selectedText = text.slice(
      selectionLocation.current,
      selectionLocationEnd.current,
    );
    const isUrl =
      selectedText &&
      isValidUrl(selectedText, { checkProtocol: true, allowRelative: false });

    const textCssClass = "link-text-button";
    const urlCssClass = "link-url-button";

    presentAlert({
      header: "Insert link",
      inputs: [
        {
          name: "text",
          placeholder: "Description",
          value: !isUrl ? selectedText : undefined,
          cssClass: textCssClass,
        },
        {
          name: "url",
          placeholder: "https://aspca.org",
          value: isUrl ? selectedText : undefined,
          cssClass: urlCssClass,
          attributes: {
            type: "url",
          },
        },
      ],
      buttons: [
        {
          text: "OK",
          handler: ({ text, url }) => {
            insertMarkdownLink(text, url);
          },
        },
        "Cancel",
      ],
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const input = document.querySelector(
          `.${isUrl || !selectedText ? textCssClass : urlCssClass}`,
        );

        if (input instanceof HTMLElement) input.focus();
      });
    });
  }

  function insertMarkdownLink(text: string = "", url?: string) {
    const markdownLink = `[${text}](${url || "url"})`;
    const toRemove = selectionLocationEnd.current - selectionLocation.current;

    const locationBeforeInsert = selectionLocation.current;
    const currentSelectionLocation = locationBeforeInsert + markdownLink.length;

    setText((text) =>
      insert(text, locationBeforeInsert, markdownLink, toRemove),
    );

    textareaRef.current?.focus();

    setTimeout(() => {
      if (!text) {
        // place cursor inside brackets
        textareaRef.current?.setSelectionRange(
          locationBeforeInsert + 1,
          locationBeforeInsert + 1,
        );
      } else if (!url) {
        // select url placeholder
        textareaRef.current?.setSelectionRange(
          currentSelectionLocation - 4,
          currentSelectionLocation - 1,
        );
      } else {
        // place cursor after link
        textareaRef.current?.setSelectionRange(
          currentSelectionLocation,
          currentSelectionLocation,
        );
      }
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
      {jsx}

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
            onInput={async (e) => {
              const image = (e.target as HTMLInputElement).files?.[0];
              if (!image) return;

              const markdown = await uploadImage(image);

              setText((text) =>
                insert(text, selectionLocation.current, markdown),
              );
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
    </>
  );
}

// Rudimentary parsing to remove recurring back slashes for display
function formatTextFace(input: string): string {
  return input.replace(/(?:\\(.))/g, "$1");
}
