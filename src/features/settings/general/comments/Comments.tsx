import { IonLabel, IonList } from "@ionic/react";
import CollapsedByDefault from "../../general/comments/CollapsedByDefault";
import DefaultSort from "./DefaultSort";
import { ListHeader } from "../../shared/formatting";
import ShowJumpButton from "./ShowJumpButton";
import JumpButtonPosition from "./JumpButtonPosition";
import HighlightNewAccount from "./HighlightNewAccount";
import TouchFriendlyLinks from "./TouchFriendlyLinks";
import TapToCollapse from "./TapToCollapse";
import ShowCommentImages from "./ShowCommentImages";
import ShowCollapsed from "./ShowCollapsed";

export default function Comments() {
  return (
    <>
      <ListHeader>
        <IonLabel>Comments</IonLabel>
      </ListHeader>
      <IonList inset>
        <DefaultSort />
        <CollapsedByDefault />
        <TapToCollapse />
        <ShowJumpButton />
        <JumpButtonPosition />
        <HighlightNewAccount />
        <TouchFriendlyLinks />
        <ShowCommentImages />
        <ShowCollapsed />
      </IonList>
    </>
  );
}
