import AppTheme from "./appTheme/AppTheme";
import CommentsTheme from "./commentsTheme/CommentsTheme";
import Dark from "./dark/Dark";
import System from "./system/System";

export default function Theme() {
  return (
    <>
      <AppTheme />
      <CommentsTheme />
      <System />
      <Dark />
    </>
  );
}
