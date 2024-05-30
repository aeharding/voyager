import { preventPhotoswipeGalleryFocusTrap } from "../../media/gallery/GalleryImg";
import Editor, { EditorProps } from "../../shared/markdown/editing/Editor";
import { MarkdownEditorIonContent } from "../../shared/markdown/editing/MarkdownToolbar";

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
