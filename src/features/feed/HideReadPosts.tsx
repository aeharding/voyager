import { useContext } from "react";
import { FeedContext } from "./FeedContext";
import { IonButton, IonIcon, useIonActionSheet } from "@ionic/react";
import { ellipsisHorizontal, eyeOffOutline } from "ionicons/icons";
import { useAppDispatch, useAppSelector } from "../../store";
import { hidePosts } from "../post/postSlice";
import { AppContext } from "../auth/AppContext";

export default function HideReadPosts() {
  const [presentActionSheet] = useIonActionSheet();
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

  function present() {
    presentActionSheet([
      {
        text: "Hide Read Posts",
        icon: eyeOffOutline,
        handler: () => {
          onHide();
        },
      },
      {
        text: "Cancel",
        role: "cancel",
      },
    ]);
  }

  return (
    <IonButton fill="default" onClick={present}>
      <IonIcon icon={ellipsisHorizontal} color="primary" />
    </IonButton>
  );
}
