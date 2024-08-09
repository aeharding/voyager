import { forwardRef } from "react";
import Editor, { EditorProps } from "../../Editor";
import { MarkdownEditorIonContent } from "../../MarkdownToolbar";
import { preventPhotoswipeGalleryFocusTrap } from "../../../../../media/gallery/GalleryImg";

export default forwardRef<HTMLTextAreaElement, EditorProps>(
  function CommentEditorContent(props, ref) {
    return (
      <MarkdownEditorIonContent {...preventPhotoswipeGalleryFocusTrap}>
        <Editor {...props} ref={ref} />
      </MarkdownEditorIonContent>
    );
  },
);
