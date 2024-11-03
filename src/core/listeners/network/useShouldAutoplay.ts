import { OAutoplayMediaType } from "#/services/db";
import { useAppSelector } from "#/store";

export default function useShouldAutoplay() {
  const autoplayMedia = useAppSelector(
    (state) => state.settings.general.posts.autoplayMedia,
  );
  const connectionType = useAppSelector(
    (state) => state.network.connectionType,
  );

  switch (autoplayMedia) {
    case OAutoplayMediaType.Always:
      return true;
    case OAutoplayMediaType.Never:
      return false;
    case OAutoplayMediaType.WifiOnly:
      return connectionType === "wifi";
  }
}
