import { IonContent } from "@ionic/react";
import { preventPhotoswipeGalleryFocusTrap } from "../../media/gallery/GalleryImg";
import { forwardRef } from "react";
import Editor, { EditorProps } from "../../shared/markdown/editing/Editor";

export default forwardRef<HTMLTextAreaElement, EditorProps>(
  function CommentEditorContent(props, ref) {
    return (
      <IonContent {...preventPhotoswipeGalleryFocusTrap}>
        <Editor {...props} ref={ref} />
      </IonContent>
    );
  },
);
