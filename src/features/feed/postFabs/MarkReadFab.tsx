import { IonFab, IonFabButton, IonIcon } from "@ionic/react";
import { eyeOffOutline } from "ionicons/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import { useContext } from "react";
import { FeedContext } from "../FeedContext";
import { AppContext } from "../../auth/AppContext";
import { hidePosts } from "../../post/postSlice";

export default function MarkReadFab() {
  const dispatch = useAppDispatch();
  const { itemsRef } = useContext(FeedContext);
  const { activePage } = useContext(AppContext);
  const postReadById = useAppSelector((state) => state.post.postReadById);

  async function onHide() {
    if (!activePage?.current) return;
    if ("querySelector" in activePage.current) return;

    const postIds: number[] | undefined = itemsRef?.current?.map(
      (item) => item.post.id
    );

    if (!postIds) return;

    const toHide = postIds.filter((id) => postReadById[id]);

    await dispatch(hidePosts(toHide));

    activePage.current.scrollToIndex({ index: 0, behavior: "auto" });
  }

  return (
    <IonFab slot="fixed" vertical="bottom" horizontal="end">
      <IonFabButton onClick={onHide}>
        <IonIcon icon={eyeOffOutline} />
      </IonFabButton>
    </IonFab>
  );
}
