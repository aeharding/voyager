import { css } from "@linaria/core";
import { IonIcon } from "@ionic/react";
import { MouseEvent, useContext } from "react";
import { PageContext } from "../../auth/PageContext";
import { useAppDispatch, useAppSelector } from "../../../store";
import { savePost } from "../postSlice";
import { bookmarkOutline } from "ionicons/icons";
import { ActionButton } from "../actions/ActionButton";
import { saveError, saveSuccess } from "../../../helpers/toastMessages";
import { ImpactStyle } from "@capacitor/haptics";
import useHapticFeedback from "../../../helpers/useHapticFeedback";
import useAppToast from "../../../helpers/useAppToast";

const savedButtonCss = css`
  background: var(--ion-color-success);
  color: var(--ion-color-primary-contrast);
`;

interface SaveButtonProps {
  postId: number;
}

export function SaveButton({ postId }: SaveButtonProps) {
  const presentToast = useAppToast();
  const dispatch = useAppDispatch();
  const { presentLoginIfNeeded } = useContext(PageContext);
  const vibrate = useHapticFeedback();

  const postSavedById = useAppSelector((state) => state.post.postSavedById);
  const mySaved = postSavedById[postId];

  async function onSavePost(e: MouseEvent) {
    e.stopPropagation();

    vibrate({ style: ImpactStyle.Light });

    if (presentLoginIfNeeded()) return;

    try {
      await dispatch(savePost(postId, !mySaved));

      if (!mySaved) presentToast(saveSuccess);
    } catch (error) {
      presentToast(saveError);

      throw error;
    }
  }

  return (
    <ActionButton
      className={mySaved ? savedButtonCss : undefined}
      onClick={onSavePost}
    >
      <IonIcon icon={bookmarkOutline} />
    </ActionButton>
  );
}
