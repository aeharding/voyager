import {
  homeOutline,
  libraryOutline,
  listOutline,
  peopleOutline,
  pinOutline,
  shieldCheckmarkOutline,
} from "ionicons/icons";
import { ODefaultFeedType } from "../../../../services/db";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { updateDefaultFeed } from "../../settingsSlice";
import SettingSelector from "../../shared/SettingSelector";
import { loggedInSelector, handleSelector } from "../../../auth/authSelectors";
import { useIonModal } from "@ionic/react";
import CommunitySelectorModal from "../../../shared/selectorModals/CommunitySelectorModal";
import { CommunityView } from "lemmy-js-client";
import { useContext } from "react";
import { PageContext } from "../../../auth/PageContext";
import { getHandle } from "../../../../helpers/lemmy";
import useSupported from "../../../../helpers/useSupported";

export default function DefaultFeed() {
  const dispatch = useAppDispatch();
  const defaultFeed = useAppSelector(
    (state) => state.settings.general.defaultFeed,
  );
  const loggedIn = useAppSelector(loggedInSelector);
  const handle = useAppSelector(handleSelector);
  const { pageRef } = useContext(PageContext);
  const moderatedFeedSupported = useSupported("Modded Feed");

  const [presentCommunitySelectorModal, onDismiss] = useIonModal(
    CommunitySelectorModal,
    {
      onDismiss: (data?: CommunityView) => {
        if (data) {
          dispatch(
            updateDefaultFeed({
              type: ODefaultFeedType.Community,
              name: getHandle(data.community),
            }),
          );
        }

        onDismiss(data);
      },
      pageRef,
    },
  );

  // When lemmy v0.18 support removed, this can be removed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = { ...ODefaultFeedType };
  if (!moderatedFeedSupported) delete options["Moderating"];

  if (!loggedIn) {
    delete options["Home"];
    delete options["Moderating"];
  }

  if (!handle || !defaultFeed) return; // must have specified handle

  return (
    <SettingSelector
      title="Default Feed"
      selected={defaultFeed.type}
      setSelected={(type) => {
        if (type === ODefaultFeedType.Community) {
          presentCommunitySelectorModal({ cssClass: "small" });

          return () => {}; // nothing to dispatch
        }

        return updateDefaultFeed({ type });
      }}
      options={options}
      optionIcons={{
        [ODefaultFeedType.Home]: homeOutline,
        [ODefaultFeedType.All]: libraryOutline,
        [ODefaultFeedType.Local]: peopleOutline,
        [ODefaultFeedType.CommunityList]: listOutline,
        [ODefaultFeedType.Community]: pinOutline,
        [ODefaultFeedType.Moderating]: shieldCheckmarkOutline,
      }}
      getSelectedLabel={(option) => {
        if (option === ODefaultFeedType.CommunityList) return "List";
        if (option === ODefaultFeedType.Community)
          // TODO SettingSelector should handle being passed a non-string item
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return `c/${(defaultFeed as any).name}`;
      }}
    />
  );
}
