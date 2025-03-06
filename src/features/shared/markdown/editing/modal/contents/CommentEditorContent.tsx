import { preventPhotoswipeGalleryFocusTrap } from "#/features/media/gallery/GalleryImg";

import Editor, { EditorProps } from "../../Editor";
import { MarkdownEditorIonContent } from "../../MarkdownToolbar";

interface CommentEditorContentProps extends EditorProps {
  ref?: React.RefObject<HTMLTextAreaElement | null>;
}

export default function CommentEditorContent(props: CommentEditorContentProps) {
  return (
    <MarkdownEditorIonContent {...preventPhotoswipeGalleryFocusTrap}>
      <Editor {...props} />
    </MarkdownEditorIonContent>
  );
}
