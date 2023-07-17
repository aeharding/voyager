import { IonLabel, IonList } from "@ionic/react";
import { ListHeader } from "../TextSize";
import BlurNsfw from "./BlurNsfw";
import PostSize from "./PostSize";

export default function Posts() {
  return (
    <>
      <ListHeader>
        <IonLabel>Posts</IonLabel>
      </ListHeader>
      <IonList inset>
        <PostSize />
        <BlurNsfw />
      </IonList>
    </>
  );
}
