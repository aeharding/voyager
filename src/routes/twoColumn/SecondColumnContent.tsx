import { use } from "react";
import { useLocation } from "react-router-dom";

import { cx } from "#/helpers/css";
import { PostPageContent } from "#/routes/pages/posts/PostPage";

import { OutletContext } from "../Outlet";
import TwoColumnEmpty from "./TwoColumnEmpty";
import { IsSecondColumnContext } from "./useIsSecondColumn";

export default function SecondColumnContent() {
  const { isTwoColumnLayout, _postDetailDictionary } = use(OutletContext);

  const tab = useLocation().pathname.split("/")[1];

  if (!isTwoColumnLayout) return null;

  const postDetail = tab ? _postDetailDictionary[tab] : undefined;

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
