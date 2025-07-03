import {
  IonButtons,
  IonContent,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router";
import { ResolveObjectResponse } from "threadiverse";

import { resolveObject } from "#/features/resolve/resolveSlice";
import AppHeader from "#/features/shared/AppHeader";
import { CenteredSpinner } from "#/features/shared/CenteredSpinner";
import { getHandle } from "#/helpers/lemmy";
import { isLemmyError } from "#/helpers/lemmyErrors";
import useAppToast from "#/helpers/useAppToast";
import Route from "#/routes/common/Route";
import ConversationPage from "#/routes/pages/inbox/ConversationPage";
import PostDetail, { PostPageContent } from "#/routes/pages/posts/PostPage";
import PostPage from "#/routes/pages/posts/PostPage";
import ProfileFeedCommentsPage from "#/routes/pages/profile/ProfileFeedCommentsPage";
import ProfileFeedHiddenPostsPage from "#/routes/pages/profile/ProfileFeedHiddenPostsPage";
import ProfileFeedPostsPage from "#/routes/pages/profile/ProfileFeedPostsPage";
import ProfileFeedSavedPage from "#/routes/pages/profile/ProfileFeedSavedPage";
import ProfileFeedVotedPage from "#/routes/pages/profile/ProfileFeedVotedPage";
import UserPage from "#/routes/pages/profile/UserPage";
import SearchFeedResultsPage from "#/routes/pages/search/results/SearchFeedResultsPage";
import CommentsPage from "#/routes/pages/shared/CommentsPage";
import CommunityCommentsPage from "#/routes/pages/shared/CommunityCommentsPage";
import CommunityPage from "#/routes/pages/shared/CommunityPage";
import CommunitySidebarPage from "#/routes/pages/shared/CommunitySidebarPage";
import InstanceSidebarPage from "#/routes/pages/shared/InstanceSidebarPage";
import ModlogPage from "#/routes/pages/shared/ModlogPage";
import ModqueuePage from "#/routes/pages/shared/ModqueuePage";
import SpecialFeedPage from "#/routes/pages/shared/SpecialFeedPage";
import { useAppDispatch } from "#/store";
import { useAppSelector } from "#/store";

import { AppBackButton } from "../twoColumn/AppBackButton";
import anyPaneGeneral from "./anyPaneGeneral";

export default [
  <Route exact path="/:tab/:actor/c/:community">
    <CommunityPage />
  </Route>,
  <Route exact path="/:tab/:actor/c/:community/search/posts/:search">
    <SearchFeedResultsPage type="Posts" />
  </Route>,
  <Route exact path="/:tab/:actor/c/:community/search/comments/:search">
    <SearchFeedResultsPage type="Comments" />
  </Route>,
  <Route exact path="/:tab/:actor/c/:community/sidebar">
    <CommunitySidebarPage />
  </Route>,
  ...anyPaneGeneral,
  <Route exact path="/:tab/:actor/c/:community/comments/:id">
    <PostDetail />
  </Route>,
  <Route
    exact
    path="/:tab/:actor/c/:community/comments/:id/thread/:threadCommentId"
  >
    <PostDetail />
  </Route>,
  <Route exact path="/:tab/:actor/c/:community/comments/:id/:commentPath">
    <PostDetail />
  </Route>,
  <Route exact path="/:tab/:actor/c/:community/comments">
    <CommunityCommentsPage />
  </Route>,
  <Route exact path="/:tab/:actor/c/:community/log">
    <ModlogPage />
  </Route>,
  <Route exact path="/:tab/:actor/c/:community/modqueue">
    <ModqueuePage />
  </Route>,
  <Route exact path="/:tab/:actor/home">
    <SpecialFeedPage type="Subscribed" />
  </Route>,
  <Route exact path="/:tab/:actor/all">
    <SpecialFeedPage type="All" />
  </Route>,
  <Route exact path="/:tab/:actor/local">
    <SpecialFeedPage type="Local" />
  </Route>,
  <Route exact path="/:tab/:actor/mod">
    <SpecialFeedPage type="ModeratorView" />
  </Route>,
  <Route exact path="/:tab/:actor/mod/comments">
    <CommentsPage type="ModeratorView" />
  </Route>,
  <Route exact path="/:tab/:actor/mod/log">
    <ModlogPage />
  </Route>,
  <Route exact path="/:tab/:actor/mod/modqueue">
    <ModqueuePage />
  </Route>,
  <Route exact path="/:tab/:actor/u/:handle">
    <UserPage />
  </Route>,
  <Route exact path="/:tab/:actor/u/:handle/posts">
    <ProfileFeedPostsPage />
  </Route>,
  <Route exact path="/:tab/:actor/u/:handle/comments">
    <ProfileFeedCommentsPage />
  </Route>,
  <Route exact path="/:tab/:actor/u/:handle/saved">
    <ProfileFeedSavedPage />
  </Route>,
  <Route exact path="/:tab/:actor/u/:handle/hidden">
    <ProfileFeedHiddenPostsPage />
  </Route>,
  <Route exact path="/:tab/:actor/u/:handle/upvoted">
    <ProfileFeedVotedPage type="Upvoted" />
  </Route>,
  <Route exact path="/:tab/:actor/u/:handle/downvoted">
    <ProfileFeedVotedPage type="Downvoted" />
  </Route>,
  <Route exact path="/:tab/:actor/u/:handle/message">
    <ConversationPage />
  </Route>,
  <Route exact path="/:tab/:actor/u/:handle/log">
    <ModlogPage />
  </Route>,
  <Route exact path="/:tab/:actor/sidebar">
    <InstanceSidebarPage />
  </Route>,
  <Route exact path="/:tab/:actor/resolve">
    <ResolvePage />
  </Route>,
];

function ResolvePage() {
  const location = useLocation();
  const objectByUrl = useAppSelector((state) => state.resolve.objectByUrl);

  const dispatch = useAppDispatch();
  const presentToast = useAppToast();

  const [resolvedObject, setResolvedObject] =
    useState<ResolveObjectResponse>(undefined);

  useEffect(() => {
    resolve();
  }, []);

  async function resolve() {
    const searchParams = new URLSearchParams(location.search);
    const url = searchParams.get("url");

    console.log(url);
    if (!url) return;

    const cachedResolvedObject = objectByUrl[url.toString()];
    if (cachedResolvedObject === "couldnt_find_object") return "not-found";

    let object = cachedResolvedObject;

    if (!object) {
      try {
        object = await dispatch(resolveObject(url.toString()));
      } catch (error) {
        if (
          // TODO START lemmy 0.19 and less support
          isLemmyError(error, "couldnt_find_object" as never) ||
          isLemmyError(error, "couldnt_find_post" as never) ||
          isLemmyError(error, "couldnt_find_comment" as never) ||
          isLemmyError(error, "couldnt_find_person" as never) ||
          isLemmyError(error, "couldnt_find_community" as never) ||
          // TODO END
          isLemmyError(error, "not_found")
        ) {
          presentToast({
            message: `Could not find ${getObjectName(
              url.pathname,
            )} on your instance. Try again to open in browser.`,
            duration: 3500,
            color: "warning",
          });
        }

        throw error;
      }
    }

    // if (object.post) {
    //   return navigateToPost(object.post);
    // } else if (object.community) {
    //   return navigateToCommunity(object.community);
    // } else if (object.person) {
    //   return navigateToUser(object.person);
    // } else if (object.comment) {
    //   return navigateToComment(object.comment);
    // }

    // return "not-found";

    setResolvedObject(object);
  }

  function renderContent() {
    if (resolvedObject?.post) {
      return (
        <PostPageContent
          id={resolvedObject.post.post.id.toString()}
          community={getHandle(resolvedObject.post.community)}
        />
      );
    }
    // else if ("community" in resolvedObject) {
    //   return <CommunityPage community={resolvedObject.community} />;
    // } else if ("person" in resolvedObject) {
    //   return <UserPage user={resolvedObject.person} />;
    // } else if ("comment" in resolvedObject) {
    //   return <CommentsPage comment={resolvedObject.comment} />;
    // }

    return (
      <>
        <AppHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <AppBackButton />
            </IonButtons>
          </IonToolbar>
        </AppHeader>
        <IonContent>
          <CenteredSpinner />
        </IonContent>
      </>
    );
  }

  return <IonPage>{renderContent()}</IonPage>;
}
