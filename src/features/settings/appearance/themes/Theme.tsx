import AppTheme from "./appTheme/AppTheme";
import CommentsTheme from "./commentsTheme/CommentsTheme";
import Dark from "./dark/Dark";
import System from "./system/System";
import VotesTheme from "./votesTheme/VotesTheme";

export default function Theme() {
  return (
    <>
      <AppTheme />
      <CommentsTheme />
      <VotesTheme />
      <System />
      <Dark />
    </>
  );
}
