import { styled } from "@linaria/react";
import MarkdownToolbar, {
  TOOLBAR_HEIGHT,
  TOOLBAR_TARGET_ID,
} from "../../shared/markdown/editing/MarkdownToolbar";
import { IonContent } from "@ionic/react";
import { preventPhotoswipeGalleryFocusTrap } from "../../media/gallery/GalleryImg";
import React, { Dispatch, SetStateAction, forwardRef, useRef } from "react";
import TextareaAutosizedForOnScreenKeyboard from "../../shared/TextareaAutosizedForOnScreenKeyboard";
import useKeyboardOpen from "../../../helpers/useKeyboardOpen";
import { useEffect } from "react";
import { preventModalSwipeOnTextSelection } from "../../../helpers/ionic";
import { mergeRefs } from "react-merge-refs";

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

interface CommentContentProps {
  text: string;
  setText: Dispatch<SetStateAction<string>>;
  onSubmit?: () => unknown;

  children?: React.ReactNode;
}

export default forwardRef<HTMLTextAreaElement, CommentContentProps>(
  function CommentContent({ text, setText, children, onSubmit }, ref) {
    const keyboardOpen = useKeyboardOpen();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      textareaRef?.current?.focus({ preventScroll: true });

      // iOS safari native has race sometimes
      setTimeout(() => {
        textareaRef.current?.focus({ preventScroll: true });
      }, 100);
    }, []);

    return (
      <>
        <IonContent {...preventPhotoswipeGalleryFocusTrap}>
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
            />
            {children}
          </Container>

          <MarkdownToolbar
            type="comment"
            text={text}
            setText={setText}
            textareaRef={textareaRef}
            slot="fixed"
          />
        </IonContent>
      </>
    );
  },
);
