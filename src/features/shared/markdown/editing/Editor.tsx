import { styled } from "@linaria/react";
import { mergeRefs } from "react-merge-refs";
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
  SetStateAction,
  forwardRef,
  useEffect,
  useRef,
} from "react";
import { preventModalSwipeOnTextSelection } from "../../../../helpers/ionic";
import useTextRecovery from "../../../../helpers/useTextRecovery";
import useUploadImage from "./useUploadImage";
import { htmlToMarkdown } from "../../../../helpers/markdown";

export const Container = styled.div<{ keyboardOpen: boolean }>`
  min-height: 100%;

  display: flex;
  flex-direction: column;

  padding-bottom: ${TOOLBAR_HEIGHT};

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

  html.ios:not(.theme-dark) & {
    background: var(--ion-item-background);
  }
`;

export interface EditorProps {
  text: string;
  setText: Dispatch<SetStateAction<string>>;
  onSubmit?: () => unknown;
  canRecoverText?: boolean;
  onDismiss?: () => void;

  children?: React.ReactNode;
}

export default forwardRef<HTMLTextAreaElement, EditorProps>(function Editor(
  { text, setText, children, onSubmit, onDismiss, canRecoverText = true },
  ref,
) {
  const keyboardOpen = useKeyboardOpen();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { uploadImage, jsx } = useUploadImage();

  useTextRecovery(text, setText, !canRecoverText);

  useEffect(() => {
    textareaRef.current?.focus({ preventScroll: true });

    // iOS safari native has race sometimes
    setTimeout(() => {
      textareaRef.current?.focus({ preventScroll: true });
    }, 100);
  }, []);

  async function onPaste(e: ClipboardEvent) {
    const html = e.clipboardData.getData("text/html");

    if (html) {
      e.preventDefault();

      let toInsert;

      try {
        toInsert = await htmlToMarkdown(html);
      } catch (error) {
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
    document.execCommand("insertText", false, markdown);
  }

  async function onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  return (
    <>
      {jsx}
      <Container keyboardOpen={keyboardOpen}>
        <Textarea
          {...preventModalSwipeOnTextSelection}
          ref={mergeRefs([textareaRef, ref])}
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
          autoCapitalize="on"
          autoCorrect="on"
          spellCheck
          id={TOOLBAR_TARGET_ID}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              onSubmit?.();
            }
            if (e.key === "Escape") {
              onDismiss?.();
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
});
