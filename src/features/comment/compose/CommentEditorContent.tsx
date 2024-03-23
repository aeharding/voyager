import { preventPhotoswipeGalleryFocusTrap } from "../../media/gallery/GalleryImg";
import { forwardRef } from "react";
import Editor, { EditorProps } from "../../shared/markdown/editing/Editor";
import { MarkdownEditorIonContent } from "../../shared/markdown/editing/MarkdownToolbar";

export default forwardRef<HTMLTextAreaElement, EditorProps>(
  function CommentEditorContent(props, ref) {
    return (
      <MarkdownEditorIonContent {...preventPhotoswipeGalleryFocusTrap}>
        <Editor {...props} ref={ref} />
      </MarkdownEditorIonContent>
    );
  },
);
