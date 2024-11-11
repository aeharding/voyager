import { IonLabel, IonList } from "@ionic/react";

import { ListHeader } from "#/features/settings/shared/formatting";

import CollapsedByDefault from "./CollapsedByDefault";
import DefaultSort from "./DefaultSort";
import HighlightNewAccount from "./HighlightNewAccount";
import JumpButtonPosition from "./JumpButtonPosition";
import RememberCommunityCommentSort from "./RememberCommunityCommentSort";
import ShowCollapsed from "./ShowCollapsed";
import ShowCommentImages from "./ShowCommentImages";
import ShowJumpButton from "./ShowJumpButton";
import TapToCollapse from "./TapToCollapse";
import TouchFriendlyLinks from "./TouchFriendlyLinks";

export default function Comments() {
  return (
    <>
      <ListHeader>
        <IonLabel>Comments</IonLabel>
      </ListHeader>
      <IonList inset>
        <DefaultSort />
        <RememberCommunityCommentSort />
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
