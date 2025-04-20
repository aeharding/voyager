import { use } from "react";

import { cx } from "#/helpers/css";
import { PostPageContent } from "#/routes/pages/posts/PostPage";

import { OutletContext } from "../Outlet";
import TwoColumnEmpty from "./TwoColumnEmpty";
import { IsSecondColumnContext } from "./useIsSecondColumn";

export default function SecondColumnContent() {
  const { twoColumnLayoutEnabled, postDetail, _postDetailDictionary } =
    use(OutletContext);

  if (!twoColumnLayoutEnabled) return null;

  return (
    <IsSecondColumnContext value={true}>
      {Object.entries(_postDetailDictionary).map(
        ([tab, currPostDetail]) =>
          currPostDetail && (
            <PostPageContent
              {...currPostDetail}
              key={`${tab}${currPostDetail.id}`}
              className={cx(currPostDetail !== postDetail && "ion-hide")}
            />
          ),
      )}
      {!postDetail && <TwoColumnEmpty />}
    </IsSecondColumnContext>
  );
}
