import TextSize from "./TextSize";
import Posts from "./posts/Posts";
import System from "./system/System";
import CompactSettings from "./CompactSettings";

export default function AppearanceSettings() {
  return (
    <>
      <TextSize />
      <Posts />
      <CompactSettings />
      <System />
    </>
  );
}
