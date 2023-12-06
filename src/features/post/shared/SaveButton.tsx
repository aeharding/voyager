import styled from "@emotion/styled";
import { IonIcon } from "@ionic/react";
import { MouseEvent, useContext } from "react";
import { PageContext } from "../../auth/PageContext";
import { useAppDispatch, useAppSelector } from "../../../store";
import { savePost } from "../postSlice";
import { css } from "@emotion/react";
import { bookmarkOutline } from "ionicons/icons";
import { ActionButton } from "../actions/ActionButton";
import { saveError, saveSuccess } from "../../../helpers/toastMessages";
import { ImpactStyle } from "@capacitor/haptics";
import useHapticFeedback from "../../../helpers/useHapticFeedback";
import useAppToast from "../../../helpers/useAppToast";

export const Item = styled(ActionButton, {
  shouldForwardProp: (prop) => prop !== "on",
})<{
  on?: boolean;
}>`
  ${({ on }) =>
    on
      ? css`
          background: var(--ion-color-success);
          color: var(--ion-color-primary-contrast);
        `
      : undefined}
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
    <Item on={mySaved} onClick={onSavePost}>
      <IonIcon icon={bookmarkOutline} />
    </Item>
  );
}
