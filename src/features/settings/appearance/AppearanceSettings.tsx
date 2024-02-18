import TextSize from "./TextSize";
import Posts from "./posts/Posts";
import CompactSettings from "./CompactSettings";
import Other from "./other/Other";
import ThemesButton from "./ThemesButton";
import LargeSettings from "./LargeSettings";

export default function AppearanceSettings() {
  return (
    <>
      <ThemesButton />
      <TextSize />
      <Posts />
      <LargeSettings />
      <CompactSettings />
      <Other />
    </>
  );
}
