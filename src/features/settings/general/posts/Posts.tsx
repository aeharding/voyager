import { IonItem, IonLabel, IonList } from "@ionic/react";

import { ListHeader } from "#/features/settings/shared/formatting";

import AutoplayMedia from "./AutoplayMedia";
import DefaultSort from "./DefaultSort";
import InfiniteScrolling from "./InfiniteScrolling";
import RememberCommunityPostSort from "./RememberCommunityPostSort";
import UpvoteOnSave from "./UpvoteOnSave";

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
