import TextSize from "./TextSize";
import Posts from "./posts/Posts";
import Comments from "./comments/Comments";
import System from "./system/System";
import CompactSettings from "./CompactSettings";

export default function AppearanceSettings() {
  return (
    <>
      <TextSize />
      <Comments />
      <Posts />
      <CompactSettings />
      <System />
    </>
  );
}
