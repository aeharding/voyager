import { useState } from "react";
import useAppToast from "../../../../helpers/useAppToast";
import { IonLoading } from "@ionic/react";
import { uploadImage } from "./uploadImageSlice";
import { useAppDispatch } from "../../../../store";

export default function useUploadImage() {
  const dispatch = useAppDispatch();
  const presentToast = useAppToast();
  const [imageUploading, setImageUploading] = useState(false);

  return {
    jsx: <IonLoading isOpen={imageUploading} message="Uploading image..." />,
    uploadImage: async (image: File, toMarkdown = false) => {
      setImageUploading(true);

      let imageUrl: string;

      try {
        imageUrl = await dispatch(uploadImage(image));
      } catch (error) {
        const message = (() => {
          if (error instanceof Error) {
            if (error.message.startsWith("NetworkError"))
              return "Issue with network connectivity, or upload was too large";

            return error.message;
          }

          return "Unknown error";
        })();

        presentToast({
          message: `Problem uploading image: ${message}. Please try again.`,
          color: "danger",
          fullscreen: true,
          duration: 5_000,
        });

        throw error;
      } finally {
        setImageUploading(false);
      }

      if (toMarkdown) return `\n![](${imageUrl})\n`;

      return imageUrl;
    },
  };
}
