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
  SetStateAction,
  forwardRef,
  useEffect,
  useRef,
} from "react";
import { preventModalSwipeOnTextSelection } from "../../../../helpers/ionic";
import useTextRecovery from "../../../../helpers/useTextRecovery";
import useUploadImage from "./useUploadImage";
import { insert } from "../../../../helpers/string";

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
  padding: 1rem;

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

  children?: React.ReactNode;
}

export default forwardRef<HTMLTextAreaElement, EditorProps>(function Editor(
  { text, setText, children, onSubmit, canRecoverText = true },
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
    const image = e.clipboardData.files?.[0];

    if (!image) return;

    e.preventDefault();

    const markdown = await uploadImage(image);

    const position = textareaRef.current?.selectionStart ?? 0;

    setText(insert(text, position, markdown));

    textareaRef.current?.focus();

    setTimeout(() => {
      const location = position + markdown.length;

      textareaRef.current?.setSelectionRange(location, location);
    });
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
          }}
          onPaste={onPaste}
        />
        {children}
      </Container>

      <MarkdownToolbar
        slot="fixed"
        type="comment"
        text={text}
        setText={setText}
        textareaRef={textareaRef}
      />
    </>
  );
});
