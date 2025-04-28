import { use } from "react";
import { useLocation } from "react-router-dom";

import { loggedInSelector } from "#/features/auth/authSelectors";
import { cx } from "#/helpers/css";
import { PostPageContent } from "#/routes/pages/posts/PostPage";
import { useAppSelector } from "#/store";

import { OutletContext } from "../Outlet";
import TwoColumnEmpty from "./TwoColumnEmpty";
import { IsSecondColumnContext } from "./useIsSecondColumn";

export default function SecondColumnContent() {
  const loggedIn = useAppSelector(loggedInSelector);
  const { postDetailDictionary, isTwoColumnLayout } = use(OutletContext);

  const tab = useLocation().pathname.split("/")[1];

  if (!isTwoColumnLayout) return;

  const postDetail =
    tab && postDetailDictionary ? postDetailDictionary[tab] : undefined;

  function shouldShowEmpty() {
    if (postDetail) return false;

    // show full screen empty state on profile tab when logged out
    if (!loggedIn && tab === "profile") return false;

    return true;
  }

  return (
    <IsSecondColumnContext value={true}>
      {postDetailDictionary &&
        Object.entries(postDetailDictionary).map(
          ([tab, currPostDetail]) =>
            currPostDetail && (
              <PostPageContent
                {...currPostDetail}
                key={`${tab}${currPostDetail.id}`}
                className={cx(currPostDetail !== postDetail && "ion-hide")}
              />
            ),
        )}
      {shouldShowEmpty() && <TwoColumnEmpty />}
    </IsSecondColumnContext>
  );
}
