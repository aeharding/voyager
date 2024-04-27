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
    uploadImage: async (image: File) => {
      setImageUploading(true);

      let imageUrl: string;

      try {
        imageUrl = await dispatch(uploadImage(image));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";

        presentToast({
          message: `Problem uploading image: ${message}. Please try again.`,
          color: "danger",
          fullscreen: true,
        });

        throw error;
      } finally {
        setImageUploading(false);
      }

      return `\n![](${imageUrl})\n`;
    },
  };
}
