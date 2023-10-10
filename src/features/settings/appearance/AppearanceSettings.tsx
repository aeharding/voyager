import TextSize from "./TextSize";
import Posts from "./posts/Posts";
import CompactSettings from "./CompactSettings";
import GeneralAppearance from "./General";
import Votes from "./Votes";
import ThemesButton from "./ThemesButton";

export default function AppearanceSettings() {
  return (
    <>
      <ThemesButton />
      <TextSize />
      <GeneralAppearance />
      <Posts />
      <CompactSettings />
      <Votes />
    </>
  );
}
