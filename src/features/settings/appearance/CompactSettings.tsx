import { IonLabel, IonList, IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../user/Profile";
import { useAppSelector, useAppDispatch } from "../../../store";
import { setShowVotingButtons, setThumbnailPosition } from "../settingsSlice";
import {
  OCompactThumbnailPositionType,
  CompactThumbnailPositionType,
} from "../../../services/db";
import { ListHeader } from "../shared/formatting";
import SettingSelector from "../shared/SettingSelector";

export default function CompactSettings() {
  const dispatch = useAppDispatch();
  const compactThumbnailsPosition = useAppSelector(
    (state) => state.settings.appearance.compact.thumbnailsPosition
  );

  const compactShowVotingButtons = useAppSelector(
    (state) => state.settings.appearance.compact.showVotingButtons
  );

  const ThumbnailPositionSelector =
    SettingSelector<CompactThumbnailPositionType>;

  return (
    <>
      <ListHeader>
        <IonLabel>Compact Posts</IonLabel>
      </ListHeader>
      <IonList inset>
        <ThumbnailPositionSelector
          title="Thumbnail Position"
          selected={compactThumbnailsPosition}
          setSelected={setThumbnailPosition}
          options={OCompactThumbnailPositionType}
        />
        <InsetIonItem>
          <IonLabel>Show Voting Buttons</IonLabel>
          <IonToggle
            checked={compactShowVotingButtons === true}
            onIonChange={(e) =>
              dispatch(setShowVotingButtons(e.detail.checked ? true : false))
            }
          />
        </InsetIonItem>
      </IonList>
    </>
  );
}
