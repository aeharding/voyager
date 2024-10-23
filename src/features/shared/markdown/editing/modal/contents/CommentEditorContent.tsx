import Editor, { EditorProps } from "../../Editor";
import { MarkdownEditorIonContent } from "../../MarkdownToolbar";
import { preventPhotoswipeGalleryFocusTrap } from "../../../../../media/gallery/GalleryImg";

interface CommentEditorContentProps extends EditorProps {
  ref?: React.RefObject<HTMLTextAreaElement>;
}

export default function CommentEditorContent(props: CommentEditorContentProps) {
  return (
    <MarkdownEditorIonContent {...preventPhotoswipeGalleryFocusTrap}>
      <Editor {...props} />
    </MarkdownEditorIonContent>
  );
}
