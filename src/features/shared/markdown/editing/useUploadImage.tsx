import { useState } from "react";
import useAppToast from "../../../../helpers/useAppToast";
import { uploadImage } from "../../../../services/lemmy";
import { IonLoading } from "@ionic/react";
import useClient from "../../../../helpers/useClient";
import { presentErrorMessage } from "../../../../helpers/error";

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
        presentToast({
          message: presentErrorMessage("Problem uploading image", error),
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
