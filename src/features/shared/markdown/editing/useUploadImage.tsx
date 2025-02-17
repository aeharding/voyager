import { IonLoading } from "@ionic/react";
import { useState } from "react";

import useAppToast from "#/helpers/useAppToast";
import { useAppDispatch } from "#/store";

import { useTemporarySelectedAccount } from "./modal/contents/TemporarySelectedAccountContext";
import { uploadImage, UploadImageContext } from "./uploadImageSlice";

export default function useUploadImage(context: UploadImageContext) {
  const dispatch = useAppDispatch();
  const presentToast = useAppToast();
  const [imageUploading, setImageUploading] = useState(false);
  const { account } = useTemporarySelectedAccount();

  return {
    jsx: <IonLoading isOpen={imageUploading} message="Uploading image..." />,
    uploadImage: async (image: File) => {
      setImageUploading(true);

      let imageUrl: string;

      try {
        imageUrl = await dispatch(uploadImage(image, context, account));
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

      return `![](${imageUrl})`;
    },
  };
}
