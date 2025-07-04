import { useIonModal } from "@ionic/react";
import { noop } from "es-toolkit";
import {
  homeOutline,
  libraryOutline,
  listOutline,
  peopleOutline,
  pinOutline,
  shieldCheckmarkOutline,
} from "ionicons/icons";
import { CommunityView } from "threadiverse";

import {
  handleSelector,
  loggedInSelector,
} from "#/features/auth/authSelectors";
import SettingSelector from "#/features/settings/shared/SettingSelector";
import CommunitySelectorModal from "#/features/shared/selectorModals/CommunitySelectorModal";
import { useAppPageRef } from "#/helpers/AppPage";
import { getHandle } from "#/helpers/lemmy";
import { ODefaultFeedType } from "#/services/db/types";
import { useAppDispatch, useAppSelector } from "#/store";

import { updateDefaultFeed } from "../../settingsSlice";

export default function DefaultFeed() {
  const dispatch = useAppDispatch();
  const defaultFeed = useAppSelector(
    (state) => state.settings.general.defaultFeed,
  );
  const loggedIn = useAppSelector(loggedInSelector);
  const handle = useAppSelector(handleSelector);
  const pageRef = useAppPageRef();

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = { ...ODefaultFeedType };

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

          return noop; // nothing to dispatch
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
          if ("name" in defaultFeed) return `c/${defaultFeed.name}`;
      }}
    />
  );
}
