import { CommentView, PostView } from "lemmy-js-client";
import { IonIcon, IonSpinner, useIonAlert } from "@ionic/react";
import { warning } from "ionicons/icons";
import { MouseEvent, useEffect } from "react";
import styled from "@emotion/styled";
import { getItemActorName, getRemoteHandle } from "../../helpers/lemmy";
import { getClient } from "../../services/lemmy";
import { useAppDispatch, useAppSelector } from "../../store";
import { invalidateObject, resolveObject } from "../resolve/resolveSlice";
import { handleSelector } from "../auth/authSelectors";

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: inherit;

  margin: -3px;
  padding: 3px;
`;

export const Spinner = styled(IonSpinner)`
  height: 1em;
  width: 1em;
`;

interface VisibleProps {
  item: PostView | CommentView;
  className?: string;
}

export default function Visible({ item, className }: VisibleProps) {
  const myHandle = useAppSelector(handleSelector);
  const objectByUrl = useAppSelector((state) => state.resolve.objectByUrl);
  const dispatch = useAppDispatch();
  const [presentAlert] = useIonAlert();

  const { ap_id } = "comment" in item ? item.comment : item.post;
  const instance = getItemActorName(item.community);
  const shouldCheck =
    getRemoteHandle(item.creator) === myHandle &&
    getItemActorName(item.creator) !== instance;

  const visible = (() => {
    if (typeof objectByUrl[ap_id] === "object") return true;
    if (objectByUrl[ap_id] === "couldnt_find_object") return false;
    return "unknown";
  })();

  useEffect(() => {
    if (visible === "unknown" && shouldCheck) {
      dispatch(resolveObject(ap_id, getClient(instance)));
    }
  }, [ap_id, instance, shouldCheck, visible, dispatch]);

  function presentVisible(e: MouseEvent) {
    e.stopPropagation();

    presentAlert({
      header: "Limited visibility",
      message: "This item is not yet visible in the community it was posted to",
      buttons: [
        {
          text: "Check again",
          role: "dismiss",
          handler: async () => {
            await dispatch(invalidateObject(ap_id));
            dispatch(resolveObject(ap_id, getClient(instance)));
          },
        },
        { text: "OK" },
      ],
    });
  }

  if (!shouldCheck) return;
  if (visible === "unknown") return <Spinner />;
  if (!visible)
    return (
      <Container onClick={presentVisible}>
        <IonIcon icon={warning} color="warning" className={className} />
      </Container>
    );
}
