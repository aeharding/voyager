import TextSize from "./TextSize";
import Posts from "./posts/Posts";
import Comments from "./comments/Comments";
import System from "./system/System";

export default function AppearanceSettings() {
  return (
    <>
      <TextSize />
      <Comments />
      <Posts />
      <System />
    </>
  );
}
