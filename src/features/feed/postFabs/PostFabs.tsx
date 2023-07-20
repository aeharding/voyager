import { useAppSelector } from "../../../store";
import MarkReadFab from "./MarkReadFab";

export default function PostFabs() {
  const showHideReadButton = useAppSelector(
    (state) => state.settings.general.posts.showHideReadButton
  );

  return <>{showHideReadButton && <MarkReadFab />}</>;
}
