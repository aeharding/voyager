import { ResolveObjectResponse } from "lemmy-js-client";
import { AppDispatch, RootState } from "../../store";
import { clientSelector } from "../auth/authSelectors";
import { receivedComments } from "../comment/commentSlice";
import { receivedCommunity } from "../community/communitySlice";
import { receivedPosts } from "../post/postSlice";
import { receivedUsers } from "../user/userSlice";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { isLemmyError } from "../../helpers/lemmy";
import { getClient } from "../../services/lemmy";
import {
  COMMENT_PATH,
  POST_PATH,
  matchLemmyCommunity,
  matchLemmyUser,
} from "../shared/useLemmyUrlHandler";

interface ResolveState {
  objectByUrl: Record<string, "couldnt_find_object" | ResolveObjectResponse>;
}

const initialState: ResolveState = {
  objectByUrl: {},
};

export const resolveSlice = createSlice({
  name: "resolve",
  initialState,
  reducers: {
    couldNotFindUrl: (state, action: PayloadAction<string>) => {
      state.objectByUrl[action.payload] = "couldnt_find_object";
    },
    resolvedObject: (
      state,
      action: PayloadAction<{
        url: string;
        object: ResolveObjectResponse;
      }>,
    ) => {
      state.objectByUrl[action.payload.url] = action.payload.object;
    },
    resetResolve: () => initialState,
  },
});

// Action creators are generated for each case reducer function
export const { couldNotFindUrl, resolvedObject, resetResolve } =
  resolveSlice.actions;

export default resolveSlice.reducer;

/**
 *
 * @param url Any URL of a remote Lemmy resource
 * @returns The object, if found
 */
export const resolveObject =
  (url: string) =>
  async (
    dispatch: AppDispatch,
    getState: () => RootState,
  ): Promise<ResolveObjectResponse> => {
    let object;

    try {
      object = await clientSelector(getState()).resolveObject({
        q: url,
      });
    } catch (error) {
      if (isLemmyError(error, "couldnt_find_object")) {
        try {
          const { hostname, pathname } = new URL(url);

          // FINE. we'll do it the hard/insecure way and ask original instance >:(
          // the below code should not need to exist.
          const client = await getClient(hostname);

          if (POST_PATH.test(pathname)) {
            const response = await client.getPost({
              id: +pathname.match(POST_PATH)![1]!,
            });

            return dispatch(resolveObject(response.post_view.post.ap_id));
          } else if (COMMENT_PATH.test(pathname)) {
            const response = await client.getComment({
              id: +pathname.match(COMMENT_PATH)![1]!,
            });

            return dispatch(resolveObject(response.comment_view.post.ap_id));
          } else if (matchLemmyUser(pathname)) {
            const [username, userHostname] = matchLemmyUser(pathname)!;

            const response = await getClient(
              userHostname ?? hostname,
            ).getPersonDetails({
              username,
            });

            return dispatch(
              resolveObject(response.person_view.person.actor_id),
            );
          } else if (matchLemmyCommunity(pathname)) {
            const [community, communityHostname] =
              matchLemmyCommunity(pathname)!;

            const response = await getClient(
              communityHostname ?? hostname,
            ).getCommunity({
              name: community,
            });

            return dispatch(
              resolveObject(response.community_view.community.actor_id),
            );
          }
        } catch (error) {
          if (isLemmyError(error, "couldnt_find_object")) {
            dispatch(couldNotFindUrl(url));
          }
          throw error;
        }
      }

      throw error;
    }

    if (object.comment) {
      dispatch(receivedComments([object.comment]));
    } else if (object.community) {
      dispatch(receivedCommunity(object.community));
    } else if (object.person) {
      dispatch(receivedUsers([object.person.person]));
    } else if (object.post) {
      dispatch(receivedPosts([object.post]));
    }

    dispatch(resolvedObject({ url, object }));

    return object;
  };
