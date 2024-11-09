import { IonItem, IonLabel, IonList, IonToggle } from "@ionic/react";

import { ListHeader } from "#/features/settings/shared/formatting";
import SettingSelector from "#/features/settings/shared/SettingSelector";
import {
  OCompactThumbnailPositionType,
  OCompactThumbnailSizeType,
} from "#/services/db";
import { useAppDispatch, useAppSelector } from "#/store";

import {
  setCompactShowSelfPostThumbnails,
  setCompactShowVotingButtons,
  setCompactThumbnailSize,
  setThumbnailPosition,
} from "../settingsSlice";

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
        <IonItem>
          <IonToggle
            checked={showVotingButtons}
            onIonChange={(e) =>
              dispatch(setCompactShowVotingButtons(!!e.detail.checked))
            }
          >
            Show Voting Buttons
          </IonToggle>
        </IonItem>
        <IonItem>
          <IonToggle
            checked={showSelfPostThumbnails}
            onIonChange={(e) =>
              dispatch(setCompactShowSelfPostThumbnails(!!e.detail.checked))
            }
          >
            Show Self Post Thumbnails
          </IonToggle>
        </IonItem>
      </IonList>
    </>
  );
}
