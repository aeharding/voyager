import Comments from "./comments/Comments";
import Other from "./other/Other";
import Posts from "./posts/Posts";
import Safari from "./safari/Safari";

export default function GeneralSettings() {
  return (
    <>
      <Posts />
      <Comments />
      <Safari />
      <Other />
    </>
  );
}
