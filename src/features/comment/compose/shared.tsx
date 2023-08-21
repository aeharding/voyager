import styled from "@emotion/styled";
import MarkdownToolbar, {
  TOOLBAR_HEIGHT,
  TOOLBAR_TARGET_ID,
} from "../../shared/markdown/editing/MarkdownToolbar";
import { IonContent } from "@ionic/react";
import { preventPhotoswipeGalleryFocusTrap } from "../../gallery/GalleryImg";
import React, { Dispatch, SetStateAction, useRef } from "react";
import TextareaAutosizedForOnScreenKeyboard from "../../shared/TextareaAutosizedForOnScreenKeyboard";
import { css } from "@emotion/react";
import useKeyboardOpen from "../../../helpers/useKeyboardOpen";

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

  ${({ theme }) =>
    !theme.dark &&
    css`
      .ios & {
        background: var(--ion-item-background);
      }
    `}
`;

interface CommentContentProps {
  text: string;
  setText: Dispatch<SetStateAction<string>>;
  submit?: () => void | Promise<void>;

  children?: React.ReactNode;
}

export default function CommentContent({
  text,
  setText,
  children,
  submit,
}: CommentContentProps) {
  const keyboardOpen = useKeyboardOpen();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <>
      <IonContent {...preventPhotoswipeGalleryFocusTrap}>
        <Container keyboardOpen={keyboardOpen}>
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
            id={TOOLBAR_TARGET_ID}
            onKeyDown={(e) => {
              if (
                (e.ctrlKey || e.metaKey) &&
                (e.keyCode === 10 || e.keyCode === 13) &&
                submit
              ) {
                submit();
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
}
