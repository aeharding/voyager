import Comments from "./comments/Comments";
import Other from "./other/Other";
import Posts from "./posts/Posts";

export default function GeneralSettings() {
  return (
    <>
      <Posts />
      <Comments />
      <Other />
    </>
  );
}
