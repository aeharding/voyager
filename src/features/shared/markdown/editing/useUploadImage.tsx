import { useState } from "react";
import useAppToast from "../../../../helpers/useAppToast";
import { uploadImage } from "../../../../services/lemmy";
import { IonLoading } from "@ionic/react";
import useClient from "../../../../helpers/useClient";

export default function useUploadImage() {
  const presentToast = useAppToast();
  const client = useClient();

  const [imageUploading, setImageUploading] = useState(false);

  return {
    jsx: <IonLoading isOpen={imageUploading} message="Uploading image..." />,
    uploadImage: async (image: File) => {
      setImageUploading(true);

      let imageUrl: string;

      try {
        imageUrl = await uploadImage(client, image);
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
