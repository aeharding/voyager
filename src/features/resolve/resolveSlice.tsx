import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NotFoundError, ResolveObjectResponse } from "threadiverse";

import { clientSelector } from "#/features/auth/authSelectors";
import { receivedComments } from "#/features/comment/commentSlice";
import { receivedCommunity } from "#/features/community/communitySlice";
import { receivedPosts } from "#/features/post/postSlice";
import { extractLemmyLinkFromPotentialFediRedirectService } from "#/features/share/fediRedirect";
import { getDetermineSoftware } from "#/features/shared/useDetermineSoftware";
import { POTENTIAL_OBJECTS } from "#/features/shared/useLemmyUrlHandler";
import { receivedUsers } from "#/features/user/userSlice";
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
    let object: ResolveObjectResponse;

    const q = normalizeObjectUrl(findFedilinkFromQuirkUrl(url));

    try {
      object = await clientSelector(getState()).resolveObject(
        { q },
        { signal },
      );
    } catch (primaryError) {
      if (!isNotFoundError(primaryError)) throw primaryError;

      // FINE. We'll do it the hard/insecure way and ask original instance >:(
      const fedilink = await resolveFedilink(q, { signal });

      if (!fedilink) {
        // Both the primary lookup and the fedilink fallback have nothing to
        // give us — the object truly isn't findable. Mark it so the UI can
        // dismiss its loading state and fall back to a plain link.
        dispatch(couldNotFindUrl(url));
        throw new Error("Could not find fedilink", { cause: primaryError });
      }

      try {
        object = await clientSelector(getState()).resolveObject(
          { q: fedilink },
          { signal },
        );
      } catch (fallbackError) {
        if (isNotFoundError(fallbackError)) dispatch(couldNotFindUrl(url));
        throw fallbackError;
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

export function unfurlRedirectServiceIfNeeded(
  url: string,
  services?: string[],
): string {
  const potentialUrl = extractLemmyLinkFromPotentialFediRedirectService(
    url,
    services,
  );

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

  if (POTENTIAL_OBJECTS.LEMMY_COMMENT_VIA_POST_PATH.test(pathname))
    return +pathname.match(POTENTIAL_OBJECTS.LEMMY_COMMENT_VIA_POST_PATH)![1]!;
}

function findPiefedCommentIdFromUrl(url: URL): number | undefined {
  const { pathname, hash } = url;

  const slug = `${pathname}${hash}`;

  if (POTENTIAL_OBJECTS.PIEFED_COMMENT_PATH_AND_HASH.test(slug))
    return +slug.match(POTENTIAL_OBJECTS.PIEFED_COMMENT_PATH_AND_HASH)![1]!;
}

function isNotFoundError(error: unknown): boolean {
  return error instanceof NotFoundError;
}
