import {
  homeOutline,
  libraryOutline,
  listOutline,
  peopleOutline,
} from "ionicons/icons";
import { ODefaultFeedType } from "../../../../services/db";
import { useAppSelector } from "../../../../store";
import { updateDefaultFeed } from "../../settingsSlice";
import SettingSelector from "../../shared/SettingSelector";
import { jwtSelector } from "../../../auth/authSlice";

export default function DefaultFeed() {
  const defaultFeed = useAppSelector(
    (state) => state.settings.general.defaultFeed,
  );
  const jwt = useAppSelector(jwtSelector);

  if (!jwt || !defaultFeed) return; // must be logged in to configure default feed

  return (
    <SettingSelector
      title="Default Feed"
      selected={defaultFeed.type}
      setSelected={(type) => updateDefaultFeed({ type })}
      options={ODefaultFeedType}
      optionIcons={{
        [ODefaultFeedType.Home]: homeOutline,
        [ODefaultFeedType.All]: libraryOutline,
        [ODefaultFeedType.Local]: peopleOutline,
        [ODefaultFeedType.CommunityList]: listOutline,
      }}
    />
  );
}
