import { IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../../routes/pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
  OCommentThreadCollapse,
  setCommentsCollapsed,
} from "../../settingsSlice";

export default function CollapsedByDefault() {
  const dispatch = useAppDispatch();
  const { collapseCommentThreads } = useAppSelector(
    // this needs a better naming
    (state) => state.settings.general.comments,
  );

  return (
    <InsetIonItem>
      <IonToggle
        checked={collapseCommentThreads === OCommentThreadCollapse.Always}
        onIonChange={(e) =>
          dispatch(
            setCommentsCollapsed(
              e.detail.checked
                ? OCommentThreadCollapse.Always
                : OCommentThreadCollapse.Never,
            ),
          )
        }
      >
        Collapse Comment Threads
      </IonToggle>
    </InsetIonItem>
  );
}
