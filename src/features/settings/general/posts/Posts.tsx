import { IonItem, IonLabel, IonList } from "@ionic/react";
import { ListHeader } from "../../shared/formatting";
import InfiniteScrolling from "./InfiniteScrolling";
import UpvoteOnSave from "./UpvoteOnSave";
import DefaultSort from "./DefaultSort";
import RememberCommunityPostSort from "./RememberCommunityPostSort";
import AutoplayMedia from "./AutoplayMedia";

export default function Posts() {
  return (
    <>
      <ListHeader>
        <IonLabel>Posts</IonLabel>
      </ListHeader>
      <IonList inset>
        <IonItem routerLink="/settings/general/hiding">
          <IonLabel className="ion-text-nowrap">
            Mark Read / Hiding Posts
          </IonLabel>
        </IonItem>
        <DefaultSort />
        <RememberCommunityPostSort />
        <InfiniteScrolling />
        <UpvoteOnSave />
        <AutoplayMedia />
      </IonList>
    </>
  );
}
