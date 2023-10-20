import { IonLabel, IonList } from "@ionic/react";
import CollapsedByDefault from "../../general/comments/CollapsedByDefault";
import DefaultSort from "./DefaultSort";
import { ListHeader } from "../../shared/formatting";
import ShowJumpButton from "./ShowJumpButton";
import JumpButtonPosition from "./JumpButtonPosition";
import HighlightNewAccount from "./HighlightNewAccount";
import TouchFriendlyLinks from "./TouchFriendlyLinks";

export default function Comments() {
  return (
    <>
      <ListHeader>
        <IonLabel>Comments</IonLabel>
      </ListHeader>
      <IonList inset>
        <CollapsedByDefault />
        <DefaultSort />
        <ShowJumpButton />
        <JumpButtonPosition />
        <HighlightNewAccount />
        <TouchFriendlyLinks />
      </IonList>
    </>
  );
}
