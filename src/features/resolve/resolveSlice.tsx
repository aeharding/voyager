import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ResolveObjectResponse } from "threadiverse";

import { clientSelector } from "#/features/auth/authSelectors";
import { receivedComments } from "#/features/comment/commentSlice";
import { receivedCommunity } from "#/features/community/communitySlice";
import { receivedPosts } from "#/features/post/postSlice";
import { extractLemmyLinkFromPotentialFediRedirectService } from "#/features/share/fediRedirect";
import { getDetermineSoftware } from "#/features/shared/useDetermineSoftware";
import {
  LEMMY_COMMENT_VIA_POST_PATH,
  PIEFED_COMMENT_PATH_AND_HASH,
} from "#/features/shared/useLemmyUrlHandler";
import { receivedUsers } from "#/features/user/userSlice";
import { isLemmyError } from "#/helpers/lemmyErrors";
import { isPiefedError } from "#/helpers/piefedErrors";
import resolveFedilink from "#/services/activitypub";
import { AppDispatch, RootState } from "#/store";

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
  (url: string, signal?: AbortSignal) =>
  async (
    dispatch: AppDispatch,
    getState: () => RootState,
  ): Promise<ResolveObjectResponse> => {
    let object;

    const q = normalizeObjectUrl(findFedilinkFromQuirkUrl(url));

    try {
      object = await clientSelector(getState()).resolveObject(
        {
          q,
        },
        { signal },
      );
    } catch (error) {
      if (isNotFoundError(error)) {
        try {
          // FINE. We'll do it the hard/insecure way and ask original instance >:(
          const fedilink = await resolveFedilink(q, { signal });

          if (!fedilink) {
            throw new Error("Could not find fedilink");
          }

          object = await clientSelector(getState()).resolveObject(
            {
              q: fedilink,
            },
            { signal },
          );
        } catch (error) {
          if (isNotFoundError(error)) {
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

  url = unfurlRedirectServiceIfNeeded(url);

  // Strip fragment
  url = url.split("#")[0]!;

  // Strip query parameters
  url = url.split("?")[0]!;

  return url;
}

export function unfurlRedirectServiceIfNeeded(url: string): string {
  const potentialUrl = extractLemmyLinkFromPotentialFediRedirectService(url);

  if (potentialUrl) return potentialUrl;

  return url;
}

/**
 * Sometimes the URL isn't an actual fedilink URL. For example,
 * https://piefed.social/post/123#comment_456. So try to extract the
 * fedilink from the URL if possible.
 */
function findFedilinkFromQuirkUrl(link: string): string {
  const software = getDetermineSoftware(new URL(link));

  switch (software) {
    case "lemmy": {
      const response = findLemmyFedilinkFromQuirkUrl(link);

      if (response) return response;

      break;
    }
    case "piefed": {
      const response = findPiefedFedilinkFromQuirkUrl(link);

      if (response) return response;
    }
  }

  return link;
}

function findPiefedFedilinkFromQuirkUrl(link: string): string | undefined {
  const url = new URL(link);
  const { hostname } = url;

  const potentialCommentId = findPiefedCommentIdFromUrl(url);

  if (typeof potentialCommentId === "number") {
    return `https://${hostname}/comment/${potentialCommentId}`;
  }
}

function findLemmyFedilinkFromQuirkUrl(link: string): string | undefined {
  const url = new URL(link);
  const { hostname } = url;

  const potentialCommentId = findLemmyCommentIdFromUrl(url);

  if (typeof potentialCommentId === "number") {
    return `https://${hostname}/comment/${potentialCommentId}`;
  }
}

function findLemmyCommentIdFromUrl(url: URL): number | undefined {
  const { pathname } = url;

  if (LEMMY_COMMENT_VIA_POST_PATH.test(pathname))
    return +pathname.match(LEMMY_COMMENT_VIA_POST_PATH)![1]!;
}

function findPiefedCommentIdFromUrl(url: URL): number | undefined {
  const { pathname, hash } = url;

  const slug = `${pathname}${hash}`;

  if (PIEFED_COMMENT_PATH_AND_HASH.test(slug))
    return +slug.match(PIEFED_COMMENT_PATH_AND_HASH)![1]!;
}

function isNotFoundError(error: unknown): boolean {
  return (
    // TODO START lemmy 0.19 and less support
    isLemmyError(error, "couldnt_find_object" as never) ||
    isLemmyError(error, "couldnt_find_post" as never) ||
    isLemmyError(error, "couldnt_find_comment" as never) ||
    isLemmyError(error, "couldnt_find_person" as never) ||
    isLemmyError(error, "couldnt_find_community" as never) ||
    // TODO END
    isLemmyError(error, "not_found") ||
    isPiefedError(error, "No object found.") ||
    false
  );
}
