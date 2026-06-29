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
import { MouseEvent } from "react";

import {
  bold,
  italic,
  listOrdered,
  listUnordered,
  quote,
  strikethrough,
  subscript,
  superscript,
} from "#/features/icons";
import { unfurlRedirectServiceIfNeeded } from "#/features/resolve/resolveSlice";
import { GO_VOYAGER_HOST } from "#/features/share/fediRedirect";
import { htmlToMarkdown } from "#/helpers/markdown";
import { isValidUrl } from "#/helpers/url";

import { EditorController } from "../controller";
import { applyMarkdownStyle, BOLD, ITALIC, QUOTE } from "../markdownStyle";
import PreviewModal from "../PreviewModal";
import useEditorHelpers from "../useEditorHelpers";
import useUploadImage from "../useUploadImage";
import textFaces from "./textFaces.txt?raw";

import styles from "./DefaultMode.module.css";

export interface SharedModeProps {
  type: "comment" | "post";
  text: string;
  controller: EditorController;
}

interface DefaultModeProps extends SharedModeProps {
  calculateMode: () => void;
}

export default function DefaultMode({
  type,
  text,
  controller,
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

  const { uploadImage, jsx } = useUploadImage("body");

  const { insertBlock, insertInline, replySelectionRef } =
    useEditorHelpers(controller);

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
              onDidDismiss: () => {
                requestAnimationFrame(() => controller.focus());
              },
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
          text: "Superscript",
          icon: superscript,
          handler: () => {
            insertInline("^superscript^", 12, 11);
          },
        },
        {
          text: "Subscript",
          icon: subscript,
          handler: () => {
            insertInline("~subscript~", 10, 9);
          },
        },
        {
          text: "Strikethrough",
          icon: strikethrough,
          handler: () => {
            insertInline("~~strikethrough~~", 15, 13);
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
    controller.focus(); // prevent keyboard flicker

    const { start, end } = controller.getSelection();
    const selectedText = text.slice(start, end);
    const isUrl =
      selectedText &&
      isValidUrl(selectedText, { checkProtocol: true, allowRelative: false });

    const textCssClass = "link-text-button";
    const urlCssClass = "link-url-button";

    function focusInput() {
      const input = document.querySelector(
        `.${isUrl || !selectedText ? textCssClass : urlCssClass}`,
      );

      if (input instanceof HTMLElement) input.focus();
    }

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
        "Cancel",
        {
          text: "OK",
          handler: ({ text, url }) => {
            insertMarkdownLink(text, url);
          },
        },
      ],
      onDidPresent: () => {
        requestAnimationFrame(focusInput);
      },
      onDidDismiss: () => {
        // Restore the editor caret when the alert closes (e.g. Cancel) —
        // refocusing a contenteditable otherwise collapses it to the start.
        requestAnimationFrame(() => controller.focus());
      },
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(focusInput);
    });
  }

  function insertMarkdownLink(text = "", url = "") {
    const unwrappedUrl = unfurlRedirectServiceIfNeeded(url, [GO_VOYAGER_HOST]);

    const markdownLink = `[${text}](${unwrappedUrl || "url"})`;

    const locationBeforeInsert = controller.getSelection().start;
    const currentSelectionLocation = locationBeforeInsert + markdownLink.length;

    controller.focus();
    controller.insertText(markdownLink);

    if (!text) {
      // place cursor inside brackets
      controller.setSelection(
        locationBeforeInsert + 1,
        locationBeforeInsert + 1,
      );
    } else if (!url) {
      // select url placeholder
      controller.setSelection(
        currentSelectionLocation - 4,
        currentSelectionLocation - 1,
      );
    } else {
      // place cursor after link
      controller.setSelection(
        currentSelectionLocation,
        currentSelectionLocation,
      );
    }
  }

  function insertAutocomplete(prefix: "@" | "!") {
    const index = controller.getSelection().start;

    // Test previous character to see if separator needed
    const needsSpace = !/^$|\s|\(|\[/.test(text[index - 1] || "");
    const space = needsSpace ? " " : "";

    const toInsert = `${space}${prefix}`;

    controller.focus();
    controller.insertText(toInsert);

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

        controller.focus();
        controller.insertText(event.detail.data);
      },
    });
  }

  async function onQuote(e: MouseEvent | TouchEvent) {
    const selection = replySelectionRef.current;
    if (!selection) return;

    // Safari will provide selection range inside textarea
    // (Unwanted since the quote style — applyMarkdownStyle(QUOTE) — handles that)
    if (selection.text && !selection.html) return;

    e.stopPropagation();
    e.preventDefault();

    let quotedText;

    try {
      quotedText = htmlToMarkdown(selection.html);
    } catch (error) {
      quotedText = selection.text;
      console.error("Parse error", error);
    }

    const insertedBlock = `> ${quotedText.trim().split("\n").join("\n> ")}`;

    insertBlock(insertedBlock);

    return false;
  }

  return (
    <>
      {jsx}

      <div className={styles.buttons}>
        <label htmlFor="photo-upload-toolbar">
          <div
            // Needs to be div for label click propagation
            role="button"
            aria-label="Upload image"
            className={styles.button}
            onClick={() => {
              controller.focus();
              return true;
            }}
          >
            <IonIcon icon={image} color="primary" />
          </div>

          <input
            className="ion-hide"
            type="file"
            accept="image/*,video/webm,video/mp4"
            id="photo-upload-toolbar"
            onInput={async (e) => {
              const image = (e.target as HTMLInputElement).files?.[0];
              if (!image) return;

              const markdown = await uploadImage(image, true);

              insertBlock(markdown);
            }}
          />
        </label>
        <button
          className={styles.button}
          aria-label="Insert link"
          onClick={presentLinkInput}
        >
          <IonIcon icon={link} color="primary" />
        </button>
        <button
          className={styles.button}
          aria-label="Bold"
          onClick={() => applyMarkdownStyle(controller, BOLD)}
        >
          <IonIcon icon={bold} color="primary" />
        </button>
        <button
          className={styles.button}
          aria-label="Italic"
          onClick={() => applyMarkdownStyle(controller, ITALIC)}
        >
          <IonIcon icon={italic} color="primary" />
        </button>
        <button
          className={styles.button}
          aria-label="Quote"
          onClickCapture={onQuote}
          onClick={() => applyMarkdownStyle(controller, QUOTE)}
        >
          <IonIcon icon={quote} color="primary" />
        </button>
        <button
          className={styles.button}
          aria-label="More formatting options"
          onClick={presentMoreOptions}
        >
          <IonIcon icon={ellipsisHorizontal} color="primary" />
        </button>
      </div>
    </>
  );
}

// Rudimentary parsing to remove recurring back slashes for display
function formatTextFace(input: string): string {
  return input.replace(/(?:\\(.))/g, "$1");
}
