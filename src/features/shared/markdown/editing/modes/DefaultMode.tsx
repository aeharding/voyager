import {
  IonIcon,
  useIonActionSheet,
  useIonAlert,
  useIonModal,
} from "@ionic/react";
import {
  codeSlashOutline,
  ellipsisHorizontal,
  eyeOutline,
  glassesOutline,
  happyOutline,
  image,
  link,
  peopleOutline,
  personOutline,
  remove,
} from "ionicons/icons";
import { MouseEvent, RefObject, useEffect, useRef } from "react";
import PreviewModal from "../PreviewModal";
import textFaces from "./textFaces.txt?raw";
import {
  bold,
  italic,
  listOrdered,
  listUnordered,
  quote,
} from "../../../../icons";
import { TOOLBAR_TARGET_ID } from "../MarkdownToolbar";
import { styled } from "@linaria/react";
import { css } from "@linaria/core";
import { isValidUrl } from "../../../../../helpers/url";
import useUploadImage from "../useUploadImage";
import { getSelectionHtml } from "../../../../../helpers/dom";
import { htmlToMarkdown } from "../../../../../helpers/markdown";

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
  textareaRef: RefObject<HTMLTextAreaElement>;
}

interface DefaultModeProps extends SharedModeProps {
  calculateMode: () => void;
}

export default function DefaultMode({
  type,
  text,
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
  const replySelectionRef = useRef<{ text: string; html: string } | undefined>(
    undefined,
  );

  useEffect(() => {
    const onChange = () => {
      selectionLocation.current = textareaRef.current?.selectionStart ?? 0;
      selectionLocationEnd.current = textareaRef.current?.selectionEnd ?? 0;

      // Not great to do this here, but if we don't,
      // safari will sometimes return selection.toString() === "" during onQuote
      const selection = window.getSelection();
      replySelectionRef.current =
        selection?.type === "Range"
          ? {
              text: selection.toString(),
              html: getSelectionHtml(selection),
            }
          : undefined;
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
          handler: () => {
            presentPreview({
              presentingElement: document.querySelector(
                "ion-modal.show-modal",
              ) as HTMLElement,
            });
          },
        },
        {
          text: "Horizontal Line",
          icon: remove,
          handler: () => {
            insertBlock("---");
          },
        },
        {
          text: "Code",
          icon: codeSlashOutline,
          handler: () => {
            insertBlock("```\ncode\n```", 8, 4);
          },
        },
        {
          text: "Spoiler",
          icon: eyeOutline,
          handler: () => {
            insertBlock(
              "::: spoiler Tap for spoiler\nhidden content\n:::",
              18,
              14,
            );
          },
        },
        {
          text: "Unordered List",
          icon: listUnordered,
          handler: () => {
            insertBlock("- ");
          },
        },
        {
          text: "Ordered List",
          icon: listOrdered,
          handler: () => {
            insertBlock("1. ");
          },
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
    textareaRef.current?.focus(); // prevent keyboard flicker

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

    const locationBeforeInsert = selectionLocation.current;
    const currentSelectionLocation = locationBeforeInsert + markdownLink.length;

    textareaRef.current?.focus();
    document.execCommand("insertText", false, markdownLink);

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

    textareaRef.current?.focus();
    document.execCommand("insertText", false, toInsert);

    calculateMode();
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

        textareaRef.current?.focus();
        document.execCommand("insertText", false, event.detail.data);
      },
    });
  }

  async function onQuote(e: MouseEvent | TouchEvent) {
    if (!textareaRef.current) return;
    const selection = replySelectionRef.current;
    if (!selection) return;

    e.stopPropagation();
    e.preventDefault();

    let quotedText;

    try {
      quotedText = await htmlToMarkdown(selection.html);
    } catch (error) {
      quotedText = selection.text;
      console.error("Parse error", error);
    }

    const insertedBlock = `> ${quotedText.trim().split("\n").join("\n> ")}`;

    insertBlock(insertedBlock);

    return false;
  }

  function insertBlock(
    blockText: string,
    placeCursorFromEnd = 0,
    selectLength = 0,
  ) {
    const currentSelectionLocation = selectionLocation.current;

    const before = (() => {
      if (
        text[currentSelectionLocation - 1] &&
        text[currentSelectionLocation - 1] === "\n" &&
        text[currentSelectionLocation - 2] &&
        text[currentSelectionLocation - 2] !== "\n"
      )
        return "\n";

      if (
        text[currentSelectionLocation - 2] &&
        text[currentSelectionLocation - 2] !== "\n"
      )
        return "\n\n";

      return "";
    })();

    const after = (() => {
      if (
        text[currentSelectionLocation] &&
        text[currentSelectionLocation] === "\n" &&
        text[currentSelectionLocation + 1] &&
        text[currentSelectionLocation + 1] !== "\n"
      )
        return "\n";

      if (
        text[currentSelectionLocation + 1] &&
        text[currentSelectionLocation + 1] !== "\n"
      )
        return "\n\n";

      return "";
    })();

    const initiallySelectedText = text
      .slice(selectionLocation.current, selectionLocationEnd.current)
      .trim();

    textareaRef.current?.focus();

    const totalBlock = `${before}${blockText}${after}`;

    document.execCommand("insertText", false, totalBlock);

    const endCursorLocation =
      currentSelectionLocation +
      before.length +
      blockText.length -
      placeCursorFromEnd;

    textareaRef.current?.setSelectionRange(
      endCursorLocation,
      endCursorLocation + selectLength,
    );

    if (initiallySelectedText && selectLength) {
      document.execCommand("insertText", false, initiallySelectedText);
    }
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

              textareaRef.current?.focus();
              document.execCommand("insertText", false, markdown);
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
