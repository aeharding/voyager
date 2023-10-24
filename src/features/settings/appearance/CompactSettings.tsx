import { IonLabel, IonList, IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../user/Profile";
import { useAppSelector, useAppDispatch } from "../../../store";
import {
  setCompactThumbnailSize,
  setShowVotingButtons,
  setThumbnailPosition,
} from "../settingsSlice";
import {
  OCompactThumbnailPositionType,
  OCompactThumbnailSizeType,
} from "../../../services/db";
import { ListHeader } from "../shared/formatting";
import SettingSelector from "../shared/SettingSelector";

export default function CompactSettings() {
  const dispatch = useAppDispatch();
  const { thumbnailsPosition, showVotingButtons, thumbnailSize } =
    useAppSelector((state) => state.settings.appearance.compact);

  const postsAppearanceType = useAppSelector(
    (state) => state.settings.appearance.posts.type,
  );

  if (!(postsAppearanceType == "compact")) return <></>;

  return (
    <>
      <ListHeader>
        <IonLabel>Compact Posts</IonLabel>
      </ListHeader>
      <IonList inset>
        <SettingSelector
          title="Thumbnail Size"
          selected={thumbnailSize}
          setSelected={setCompactThumbnailSize}
          options={OCompactThumbnailSizeType}
          getOptionLabel={(o) => {
            if (o === OCompactThumbnailSizeType.Small) return "Small (default)";
          }}
        />
        <SettingSelector
          title="Thumbnail Position"
          selected={thumbnailsPosition}
          setSelected={setThumbnailPosition}
          options={OCompactThumbnailPositionType}
        />
        <InsetIonItem>
          <IonLabel>Show Voting Buttons</IonLabel>
          <IonToggle
            checked={showVotingButtons}
            onIonChange={(e) =>
              dispatch(setShowVotingButtons(e.detail.checked ? true : false))
            }
          />
        </InsetIonItem>
      </IonList>
    </>
  );
}
