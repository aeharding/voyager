import TextSize from "./TextSize";
import Posts from "./posts/Posts";
import System from "./system/System";
import CompactSettings from "./CompactSettings";
import GeneralAppearance from "./General";

export default function AppearanceSettings() {
  return (
    <>
      <TextSize />
      <GeneralAppearance />
      <Posts />
      <CompactSettings />
      <System />
    </>
  );
}
