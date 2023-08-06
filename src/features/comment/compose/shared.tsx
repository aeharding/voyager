import styled from "@emotion/styled";
import MarkdownToolbar, {
  TOOLBAR_HEIGHT,
  TOOLBAR_TARGET_ID,
} from "../../shared/markdown/editing/MarkdownToolbar";
import { IonContent } from "@ionic/react";
import { preventPhotoswipeGalleryFocusTrap } from "../../gallery/GalleryImg";
import useKeyboardHeight from "../../../helpers/useKeyboardHeight";
import React, { Dispatch, SetStateAction, useRef } from "react";
import TextareaAutosizedForOnScreenKeyboard from "../../shared/TextareaAutosizedForOnScreenKeyboard";
import { css } from "@emotion/react";

export const Container = styled.div<{ keyboardHeight: number }>`
  min-height: 100%;

  display: flex;
  flex-direction: column;

  padding-bottom: ${TOOLBAR_HEIGHT};

  @media screen and (max-width: 767px) {
    padding-bottom: ${({ keyboardHeight }) =>
      keyboardHeight
        ? TOOLBAR_HEIGHT
        : `calc(${TOOLBAR_HEIGHT} + env(safe-area-inset-bottom))`};
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

  children?: React.ReactNode;
}

export default function CommentContent({
  text,
  setText,
  children,
}: CommentContentProps) {
  const keyboardHeight = useKeyboardHeight();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <>
      <IonContent {...preventPhotoswipeGalleryFocusTrap}>
        <Container keyboardHeight={keyboardHeight}>
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
            id={TOOLBAR_TARGET_ID}
          />
          {children}
        </Container>
      </IonContent>

      <MarkdownToolbar
        type="comment"
        text={text}
        setText={setText}
        textareaRef={textareaRef}
      />
    </>
  );
}
