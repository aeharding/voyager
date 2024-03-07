import { openOutline, readerOutline } from "ionicons/icons";
import { OLinkHandlerType } from "../../../../services/db";
import { useAppSelector } from "../../../../store";
import { setLinkHandler } from "../../settingsSlice";
import SettingSelector from "../../shared/SettingSelector";
import { isNative } from "../../../../helpers/device";

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
