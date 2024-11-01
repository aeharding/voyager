import { styled } from "@linaria/react";
import TextareaAutosizedForOnScreenKeyboard from "../../TextareaAutosizedForOnScreenKeyboard";
import MarkdownToolbar, {
  TOOLBAR_HEIGHT,
  TOOLBAR_TARGET_ID,
} from "./MarkdownToolbar";
import useKeyboardOpen from "../../../../helpers/useKeyboardOpen";
import {
  ClipboardEvent,
  Dispatch,
  DragEvent,
  KeyboardEvent,
  SetStateAction,
  useEffect,
  useRef,
} from "react";
import { preventModalSwipeOnTextSelection } from "../../../../helpers/ionic";
import useTextRecovery from "../../../../helpers/useTextRecovery";
import useUploadImage from "./useUploadImage";
import { htmlToMarkdown } from "../../../../helpers/markdown";
import useEditorHelpers from "./useEditorHelpers";
import { useMergedRef } from "@mantine/hooks";

const ORDERED_LIST_REGEX = /^(\d)\. /;
const UNORDERED_LIST_REGEX = /^(-|\*|\+) /;

export const Container = styled.div<{ keyboardOpen: boolean }>`
  min-height: 100%;

  display: flex;
  flex-direction: column;

  padding-bottom: ${TOOLBAR_HEIGHT};

  html.ios:not(.ion-palette-dark) & {
    background: var(--ion-item-background);
  }

  @media screen and (max-width: 767px) {
    padding-bottom: ${({ keyboardOpen }) =>
      keyboardOpen
        ? TOOLBAR_HEIGHT
        : `calc(${TOOLBAR_HEIGHT} + var(--ion-safe-area-bottom, env(safe-area-inset-bottom)))`};
  }
`;

export const Textarea = styled(TextareaAutosizedForOnScreenKeyboard)`
  border: 0;
  background: none;
  resize: none;
  outline: 0;
  padding: 16px;

  min-height: 200px;

  flex: 1 0 auto;
`;

export interface EditorProps {
  text: string;
  setText: Dispatch<SetStateAction<string>>;
  onSubmit?: () => unknown;
  canRecoverText?: boolean;
  onDismiss?: () => void;

  children?: React.ReactNode;

  ref?: React.RefObject<HTMLTextAreaElement>;
}

export default function Editor({
  text,
  setText,
  children,
  onSubmit,
  onDismiss,
  canRecoverText = true,
  ref,
}: EditorProps) {
  const keyboardOpen = useKeyboardOpen();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { insertBlock } = useEditorHelpers(textareaRef);

  const { uploadImage, jsx: uploadImageJsx } = useUploadImage();

  useTextRecovery(text, setText, !canRecoverText);

  useEffect(() => {
    textareaRef.current?.focus({ preventScroll: true });

    // iOS safari native has race sometimes
    setTimeout(() => {
      if (!textareaRef.current) return;

      textareaRef.current.focus({ preventScroll: true });

      // Place cursor at end
      const len = textareaRef.current.value.length;
      textareaRef.current?.setSelectionRange(len, len);
    }, 100);
  }, []);

  async function onPaste(e: ClipboardEvent) {
    const html = e.clipboardData.getData("text/html");

    if (html) {
      e.preventDefault();

      let toInsert;

      try {
        toInsert = await htmlToMarkdown(html);
      } catch (_) {
        toInsert = e.clipboardData.getData("Text");
        console.error("Parse error", e);
      }

      document.execCommand("insertText", false, toInsert);
    }

    const image = e.clipboardData.files?.[0];

    if (!image) return;

    e.preventDefault();

    onReceivedImage(image);
  }

  async function onDragCapture(event: DragEvent) {
    const image = event.dataTransfer.files[0];

    if (!image) return;

    onReceivedImage(image);
  }

  async function onReceivedImage(image: File) {
    const markdown = await uploadImage(image);

    textareaRef.current?.focus();
    insertBlock(markdown);
  }

  async function onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  async function autocompleteListIfNeeded(e: KeyboardEvent) {
    if (
      !textareaRef.current ||
      textareaRef.current.selectionStart !== textareaRef.current.selectionStart
    )
      return;

    const currentText = textareaRef.current.value.slice(
      0,
      textareaRef.current.selectionStart,
    ); // -1: already hit enter

    const lastNewlineIndex = currentText.lastIndexOf("\n") ?? 0;

    const lastLine = currentText.slice(
      lastNewlineIndex + 1,
      currentText.length,
    );

    const orderedMatch = lastLine.match(ORDERED_LIST_REGEX);
    if (orderedMatch?.[1]) {
      const listNumber = +orderedMatch[1];
      if (listNumber >= 9) return; // only support up to 9 items for now to avoid annoying autocomplete

      // if pressing <enter> on empty list item, bail and remove empty item
      if (orderedMatch[0] === lastLine) {
        textareaRef.current.setSelectionRange(
          textareaRef.current.selectionStart - orderedMatch[0].length,
          textareaRef.current.selectionStart,
        );
        return;
      }

      e.preventDefault();
      document.execCommand("insertText", false, `\n${listNumber + 1}. `);
    }

    const unorderedMatch = lastLine.match(UNORDERED_LIST_REGEX);
    if (unorderedMatch?.[1]) {
      // if pressing <enter> on empty list item, bail and remove empty item
      if (unorderedMatch[0] === lastLine) {
        textareaRef.current.setSelectionRange(
          textareaRef.current.selectionStart - unorderedMatch[0].length,
          textareaRef.current.selectionStart,
        );
        return;
      }

      e.preventDefault();
      document.execCommand("insertText", false, `\n${unorderedMatch?.[1]} `);
    }
  }

  return (
    <>
      {uploadImageJsx}
      <Container keyboardOpen={keyboardOpen}>
        <Textarea
          {...preventModalSwipeOnTextSelection}
          ref={useMergedRef(textareaRef, ref)}
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
          autoCapitalize="on"
          autoCorrect="on"
          spellCheck
          id={TOOLBAR_TARGET_ID}
          onKeyDown={(e) => {
            switch (e.key) {
              case "Enter": {
                if (e.ctrlKey || e.metaKey) {
                  onSubmit?.();
                } else {
                  autocompleteListIfNeeded(e);
                }
                break;
              }
              case "Escape":
                onDismiss?.();
                break;
            }
          }}
          onPaste={onPaste}
          onDropCapture={onDragCapture}
          onDragOver={onDragOver}
        />
        {children}
      </Container>

      <MarkdownToolbar
        slot="fixed"
        type="comment"
        text={text}
        textareaRef={textareaRef}
      />
    </>
  );
}
