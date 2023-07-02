import TextSize from "./TextSize";
import Posts from "./posts/Posts";
import System from "./system/System";
import CompactSettings from "./CompactSettings";
import GeneralAppearance from "./General";
import Voting from "./Voting";

export default function AppearanceSettings() {
  return (
    <>
      <TextSize />
      <GeneralAppearance />
      <Posts />
      <CompactSettings />
      <Voting />
      <System />
    </>
  );
}
