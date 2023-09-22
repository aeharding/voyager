import styled from "@emotion/styled";
import { IonIcon, useIonToast } from "@ionic/react";
import { MouseEvent } from "react";
import { usePageContext } from "../../auth/PageContext";
import { useAppDispatch, useAppSelector } from "../../../store";
import { savePost } from "../postSlice";
import { css } from "@emotion/react";
import { bookmarkOutline } from "ionicons/icons";
import { ActionButton } from "../actions/ActionButton";
import { saveError } from "../../../helpers/toastMessages";
import { ImpactStyle } from "@capacitor/haptics";
import useHapticFeedback from "../../../helpers/useHapticFeedback";

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
  const [present] = useIonToast();
  const dispatch = useAppDispatch();
  const { presentLoginIfNeeded } = usePageContext();
  const vibrate = useHapticFeedback();

  const postSavedById = useAppSelector((state) => state.post.postSavedById);
  const mySaved = postSavedById[postId];

  async function onSavePost(e: MouseEvent) {
    e.stopPropagation();

    vibrate({ style: ImpactStyle.Light });

    if (presentLoginIfNeeded()) return;

    try {
      await dispatch(savePost(postId, !postSavedById[postId]));
    } catch (error) {
      present(saveError);

      throw error;
    }
  }

  return (
    <Item on={mySaved} onClick={onSavePost}>
      <IonIcon icon={bookmarkOutline} />
    </Item>
  );
}
