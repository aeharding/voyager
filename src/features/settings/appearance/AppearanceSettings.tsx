import TextSize from "./TextSize";
import Posts from "./posts/Posts";
import System from "./system/System";
import CompactSettings from "./CompactSettings";
import GeneralAppearance from "./General";
import Votes from "./Votes";

export default function AppearanceSettings() {
  return (
    <>
      <TextSize />
      <GeneralAppearance />
      <Posts />
      <CompactSettings />
      <Votes />
      <System />
    </>
  );
}
