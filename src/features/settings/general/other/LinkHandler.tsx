import { openOutline, readerOutline } from "ionicons/icons";

import SettingSelector from "#/features/settings/shared/SettingSelector";
import { isNative } from "#/helpers/device";
import { OLinkHandlerType } from "#/services/db";
import { useAppSelector } from "#/store";

import { setLinkHandler } from "../../settingsSlice";

export default function LinkHandler() {
  const linkHandler = useAppSelector(
    (state) => state.settings.general.linkHandler,
  );

  if (!isNative()) return;

  return (
    <SettingSelector
      title="Open Links In"
      selected={linkHandler}
      setSelected={setLinkHandler}
      options={OLinkHandlerType}
      optionIcons={{
        [OLinkHandlerType.DefaultBrowser]: openOutline,
        [OLinkHandlerType.InApp]: readerOutline,
      }}
    />
  );
}
