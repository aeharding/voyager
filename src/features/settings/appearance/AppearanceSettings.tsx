import CompactSettings from "./CompactSettings";
import LargeSettings from "./LargeSettings";
import TextSize from "./TextSize";
import ThemesButton from "./ThemesButton";
import Other from "./other/Other";
import Posts from "./posts/Posts";

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
