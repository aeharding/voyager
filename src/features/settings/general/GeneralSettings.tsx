import Comments from "./comments/Comments";
import Media from "./media/Media";
import Other from "./other/Other";
import Posts from "./posts/Posts";
import Safari from "./safari/Safari";

export default function GeneralSettings() {
  return (
    <>
      <Posts />
      <Comments />
      <Safari />
      <Media />
      <Other />
    </>
  );
}
