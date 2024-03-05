import { useState } from "react";
import useAppToast from "../../../../helpers/useAppToast";
import { useAppSelector } from "../../../../store";
import { jwtSelector, urlSelector } from "../../../auth/authSelectors";
import { uploadImage } from "../../../../services/lemmy";
import { IonLoading } from "@ionic/react";

export default function useUploadImage() {
  const presentToast = useAppToast();
  const jwt = useAppSelector(jwtSelector);
  const instanceUrl = useAppSelector(urlSelector);

  const [imageUploading, setImageUploading] = useState(false);

  return {
    jsx: <IonLoading isOpen={imageUploading} message="Uploading image..." />,
    uploadImage: async (image: File) => {
      if (!jwt) throw new Error("jwt expected for image upload");

      setImageUploading(true);

      let imageUrl: string;

      try {
        imageUrl = await uploadImage(instanceUrl, jwt, image);
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
