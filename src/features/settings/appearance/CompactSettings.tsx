import { IonLabel, IonList, IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../user/Profile";
import { useAppSelector, useAppDispatch } from "../../../store";
import {
  setCompactShowSelfPostThumbnails,
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
  const {
    thumbnailsPosition,
    showVotingButtons,
    thumbnailSize,
    showSelfPostThumbnails,
  } = useAppSelector((state) => state.settings.appearance.compact);

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
          <IonToggle
            checked={showVotingButtons}
            onIonChange={(e) =>
              dispatch(setShowVotingButtons(!!e.detail.checked))
            }
          >
            Show Voting Buttons
          </IonToggle>
        </InsetIonItem>
        <InsetIonItem>
          <IonToggle
            checked={showSelfPostThumbnails}
            onIonChange={(e) =>
              dispatch(setCompactShowSelfPostThumbnails(!!e.detail.checked))
            }
          >
            Show Self Post Thumbnails
          </IonToggle>
        </InsetIonItem>
      </IonList>
    </>
  );
}
