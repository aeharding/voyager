import styled from "@emotion/styled";
import { useIonModal, useIonToast } from "@ionic/react";
import Login from "../../auth/Login";
import { MouseEvent, useContext } from "react";
import { PageContext } from "../../auth/PageContext";
import { useAppDispatch, useAppSelector } from "../../../store";
import { savePost } from "../postSlice";
import { css } from "@emotion/react";
import { bookmarkOutline } from "ionicons/icons";
import { ActionButton } from "../actions/ActionButton";
import { saveError } from "../../../helpers/toastMessages";
import { jwtSelector } from "../../auth/authSlice";
import IonIconWrapper from "../../../helpers/ionIconWrapper";

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
  const pageContext = useContext(PageContext);
  const [login, onDismiss] = useIonModal(Login, {
    onDismiss: (data: string, role: string) => onDismiss(data, role),
  });
  const jwt = useAppSelector(jwtSelector);

  const postSavedById = useAppSelector((state) => state.post.postSavedById);
  const mySaved = postSavedById[postId];

  async function onSavePost(e: MouseEvent) {
    e.stopPropagation();

    if (!jwt) return login({ presentingElement: pageContext.page });

    try {
      await dispatch(savePost(postId, !postSavedById[postId]));
    } catch (error) {
      present(saveError);

      throw error;
    }
  }

  return (
    <Item on={mySaved} onClick={onSavePost}>
      <IonIconWrapper icon={bookmarkOutline} />
    </Item>
  );
}
