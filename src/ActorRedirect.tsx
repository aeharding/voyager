import { useIonRouter, createAnimation } from "@ionic/react";
import { Redirect, useLocation, useParams } from "react-router";
import {
  AppDispatch,
  RootState,
  useAppDispatch,
  useAppSelector,
} from "./store";

import { resetPosts } from "./features/post/postSlice";
import { resetComments } from "./features/comment/commentSlice";

import {
  jwtIssSelector,
  jwtSelector,
  clientSelector,
} from "./features/auth/authSlice";
import React from "react";
import UseIonViewIsVisible from "./helpers/useIonViewIsVisible";

interface ActorRedirectProps {
  children?: React.ReactNode;
}

const redirectToNewCommentsView = async (
  replaceRouteWithoutAnimation: (newRoute: string) => void,
  apId: string,
  jwt: string,
  state: RootState,
  iss: string | undefined,
  dispatch: AppDispatch,
) => {
  const result = await clientSelector(state).resolveObject({
    q: apId,
    auth: jwt,
  });
  if (result) {
    const postId = result.post?.post?.id;
    const communityLinkArray = result.post?.community?.actor_id.split("/");
    if (communityLinkArray) {
      const communityInstance = communityLinkArray[2];
      const communityName = communityLinkArray[4];
      const newLink = `/posts/${iss}/c/${communityName}@${communityInstance}/comments/${postId}`;
      if (window.location.pathname !== newLink) {
        replaceRouteWithoutAnimation(newLink);
        dispatch(resetPosts());
        dispatch(resetComments());
      }
    }
  }
};

export default function ActorRedirect({ children }: ActorRedirectProps) {
  const { actor } = useParams<{ actor: string }>();
  const iss = useAppSelector(jwtIssSelector);
  const location = useLocation();
  const ionViewIsVisible = UseIonViewIsVisible();
  const dispatch = useAppDispatch();

  const jwt = useAppSelector(jwtSelector);

  const [first, second, _wrongActor, ...urlEnd] = location.pathname.split("/");

  const postById = useAppSelector((state) => state.post.postById);
  const state = useAppSelector((state) => state);

  const router = useIonRouter();

  const replaceRouteWithoutAnimation = (newRoute: string) => {
    router.push(
      newRoute,
      "back",
      "replace",
      {},
      () => createAnimation(), // this is to disable the page animation
    );
  };

  if (iss !== actor) {
    if (second === "posts" && urlEnd[2] === "comments") {
      // we resolve the post for new iss and redirect to it
      const postId = urlEnd[3];

      const post = postById[postId];
      if (post !== "not-found") {
        const apId = post?.post?.ap_id;
        if (apId) {
          if (jwt) {
            redirectToNewCommentsView(
              replaceRouteWithoutAnimation,
              apId,
              jwt,
              state,
              iss,
              dispatch,
            );
          }
        }

        return;
      }
    } else if (second === "posts") {
      const newLink = [first, second, iss, ...urlEnd].join("/");
      if (window.location.pathname !== newLink) {
        replaceRouteWithoutAnimation(newLink);
      }
    }
  }

  if (!ionViewIsVisible) return <>{children}</>;
  if (!iss || !actor) return <>{children}</>;
  if (iss === actor) return <>{children}</>;

  return (
    <Redirect to={[first, second, iss, ...urlEnd].join("/")} push={false} />
  );
}
