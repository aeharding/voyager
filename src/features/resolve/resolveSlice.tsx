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
          const fedilink = await findFedilink(url);

          if (!fedilink) {
            dispatch(couldNotFindUrl(url));
            throw new Error("Could not find fedilink");
          }

          object = await clientSelector(getState()).resolveObject({
            q: fedilink,
          });
        } catch (error) {
          if (isLemmyError(error, "couldnt_find_object")) {
            dispatch(couldNotFindUrl(url));
          }
          throw error;
        }
      } else {
        throw error;
      }
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

export function normalizeObjectUrl(objectUrl: string) {
  let url = objectUrl;

  // Replace app schema "vger" with "https"
  url = url.replace(/^vger:\/\//, "https://");

  // Strip fragment
  url = url.split("#")[0]!;

  // Strip query parameters
  url = url.split("?")[0]!;

  return url;
}

/**
 * FINE. we'll do it the hard/insecure way and ask original instance >:(
 * the below code should not need to exist.
 */
async function findFedilink(url: string): Promise<string | undefined> {
  const { hostname, pathname } = new URL(normalizeObjectUrl(url));

  const client = await getClient(hostname);

  if (POST_PATH.test(pathname)) {
    const response = await client.getPost({
      id: +pathname.match(POST_PATH)![1]!,
    });

    return response.post_view.post.ap_id;
  } else if (COMMENT_PATH.test(pathname)) {
    const response = await client.getComment({
      id: +pathname.match(COMMENT_PATH)![1]!,
    });

    return response.comment_view.comment.ap_id;
  } else if (matchLemmyUser(pathname)) {
    const [username, userHostname] = matchLemmyUser(pathname)!;

    const response = await getClient(userHostname ?? hostname).getPersonDetails(
      {
        username,
      },
    );

    return response.person_view.person.actor_id;
  } else if (matchLemmyCommunity(pathname)) {
    const [community, communityHostname] = matchLemmyCommunity(pathname)!;

    const response = await getClient(
      communityHostname ?? hostname,
    ).getCommunity({
      name: community,
    });

    return response.community_view.community.actor_id;
  }
}
