import { useContext } from "react";
import { FeedContext } from "./FeedContext";
import { IonIcon } from "@ionic/react";
import { eyeOff } from "ionicons/icons";
import { useAppDispatch, useAppSelector } from "../../store";
import { hidePost } from "../post/postSlice";

export default function HideReadPosts() {
  const dispatch = useAppDispatch();
  const { itemsRef } = useContext(FeedContext);
  const postReadById = useAppSelector((state) => state.post.postReadById);

  return (
    <IonIcon
      icon={eyeOff}
      onClick={async () => {
        const postIds: number[] = itemsRef.current.map((item) => item.post.id);

        const toHide = postIds.filter((id) => postReadById[id]);

        for (const postId of toHide) {
          dispatch(hidePost(postId));
        }
      }}
    />
  );
}
