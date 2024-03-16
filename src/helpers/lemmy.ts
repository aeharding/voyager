import {
  Comment,
  CommentView,
  Community,
  CommunityModeratorView,
  GetSiteResponse,
  LemmyErrorType,
  Post,
  PostView,
} from "lemmy-js-client";
import { Share } from "@capacitor/share";
import { escapeStringForRegex } from "./regex";
import { quote } from "./markdown";

export interface LemmyJWT {
  sub: number;
  iss: string; // e.g. "lemmy.ml"
  iat: number;
}

export interface CommentNodeI {
  comment_view: CommentView;
  children: Array<CommentNodeI>;
  depth: number;
  absoluteDepth: number;
  missing?: number;
}

export const MAX_DEFAULT_COMMENT_DEPTH = 6;

/**
 * @param item Community, Person, etc
 */
export function getItemActorName(item: Pick<Community, "actor_id">) {
  return new URL(item.actor_id).hostname;
}

export function checkIsMod(communityHandle: string, site: GetSiteResponse) {
  return site?.my_user?.moderates.find(
    (m) => getHandle(m.community) === communityHandle,
  );
}

/**
 * @param item Community, Person, etc
 */
export function getHandle(
  item: Pick<Community, "name" | "actor_id" | "local">,
) {
  return item.local ? item.name : getRemoteHandle(item);
}

export function getRemoteHandle(
  item: Pick<Community, "name" | "actor_id" | "local">,
) {
  return `${item.name}@${getItemActorName(item)}`;
}

export function getRemoteHandleFromHandle(
  handle: string,
  connectedInstance: string,
): string {
  if (handle.includes("@")) return handle;

  return `${handle}@${connectedInstance}`;
}

export function canModify(comment: Comment) {
  return !comment.deleted && !comment.removed;
}

export function buildCommentsTree(
  comments: CommentView[],
  parentComment: boolean,
): CommentNodeI[] {
  const map = new Map<number, CommentNodeI>();
  const depthOffset = !parentComment
    ? 0
    : getDepthFromComment(comments[0]!.comment) ?? 0;

  for (const comment_view of comments) {
    const depthI = getDepthFromComment(comment_view.comment) ?? 0;
    const depth = depthI ? depthI - depthOffset : 0;
    const node: CommentNodeI = {
      comment_view,
      children: [],
      depth,
      absoluteDepth: depthI,
    };
    map.set(comment_view.comment.id, { ...node });
  }

  const tree: CommentNodeI[] = [];

  // if its a parent comment fetch, then push the first comment to the top node.
  if (parentComment) {
    const cNode = map.get(comments[0]!.comment.id);
    if (cNode) {
      tree.push(cNode);
    }
  }

  for (const comment_view of comments) {
    const child = map.get(comment_view.comment.id);
    if (child) {
      const parent_id = getCommentParentId(comment_view.comment);
      if (parent_id) {
        const parent = map.get(parent_id);
        // Necessary because blocked comment might not exist
        if (parent) {
          parent.children.push(child);
        }
      } else {
        if (!parentComment) {
          tree.push(child);
        }
      }
    }
  }

  return tree;
}

/**
 * Traverse an existing comment tree to determine if there are any
 * missing comments for a given node
 *
 * NOTE: This function mutates the tree to add `missing` to each node!
 */
export function buildCommentsTreeWithMissing(
  comments: CommentView[],
  parentComment: boolean,
): CommentNodeI[] {
  const tree = buildCommentsTree(comments, parentComment);

  function childHasMissing(node: CommentNodeI): {
    missing: boolean;
    count: number;
  } {
    let totalChildren = 0;
    let missingMarker = false;

    for (const child of node.children) {
      const res = childHasMissing(child);
      totalChildren += res.count;
      if (res.missing) missingMarker = true;
    }

    const missing =
      node.comment_view.counts.child_count -
      node.children.length -
      totalChildren;

    node.missing = missingMarker ? 0 : missing;

    return {
      missing: missingMarker || !!missing,
      count: totalChildren + node.children.length,
    };
  }

  for (const node of tree) {
    childHasMissing(node);
  }

  return tree;
}

export function getCommentParentId(comment?: Comment): number | undefined {
  const split = comment?.path.split(".");
  // remove the 0
  split?.shift();

  return split && split.length > 1
    ? Number(split.at(split.length - 2))
    : undefined;
}

export function getDepthFromComment(comment?: Comment): number | undefined {
  return comment ? getDepthFromCommentPath(comment.path) : undefined;
}

export function getDepthFromCommentPath(path: string): number {
  const len = path.split(".").length;
  return len - 2;
}

export function insertCommentIntoTree(
  tree: CommentNodeI[],
  cv: CommentView,
  parentComment: boolean,
) {
  // Building a fake node to be used for later
  const node: CommentNodeI = {
    comment_view: cv,
    children: [],
    depth: 0,
    absoluteDepth: 0,
  };

  const parentId = getCommentParentId(cv.comment);
  if (parentId) {
    const parent_comment = searchCommentTree(tree, parentId);
    if (parent_comment) {
      node.depth = parent_comment.depth + 1;
      parent_comment.children.unshift(node);
    }
  } else if (!parentComment) {
    tree.unshift(node);
  }
}

export function searchCommentTree(
  tree: CommentNodeI[],
  id: number,
): CommentNodeI | undefined {
  for (const node of tree) {
    if (node.comment_view.comment.id === id) {
      return node;
    }

    for (const child of node.children) {
      const res = searchCommentTree([child], id);

      if (res) {
        return res;
      }
    }
  }
  return undefined;
}

export function getFlattenedChildren(comment: CommentNodeI): CommentView[] {
  const flattenedChildren: CommentView[] = [];

  function flattenChildren(comment: CommentNodeI) {
    if (comment.children.length === 0) {
      flattenedChildren.push(comment.comment_view);
    } else {
      comment.children.forEach((child) => {
        flattenedChildren.push(child.comment_view);
        flattenChildren(child);
      });
    }
  }

  flattenChildren(comment);

  return flattenedChildren;
}

export function share(item: Post | Comment) {
  return Share.share({ url: item.ap_id });
}

export function postHasFilteredKeywords(
  post: Post,
  keywords: string[],
): boolean {
  for (const keyword of keywords) {
    if (keywordFoundInSentence(keyword, post.name)) return true;
  }

  return false;
}

export function keywordFoundInSentence(
  keyword: string,
  sentence: string,
): boolean {
  // Escape the keyword for use in a regular expression
  const escapedKeyword = escapeStringForRegex(keyword);

  // Create a regular expression pattern to match the escaped keyword as a whole word
  const pattern = new RegExp(`\\b${escapedKeyword}\\b`, "i");

  // Use the RegExp test method to check if the pattern is found in the sentence
  return pattern.test(sentence);
}

export type LemmyErrorValue = LemmyErrorType["error"];
export type OldLemmyErrorValue = never; // When removing support for an old version of Lemmy, cleanup these references

export function isLemmyError(error: unknown, lemmyErrorValue: LemmyErrorValue) {
  if (!(error instanceof Error)) return;
  return error.message === lemmyErrorValue;
}

export function canModerateCommunity(
  communityId: number | undefined,
  moderates: CommunityModeratorView[] | undefined,
): boolean {
  if (communityId === undefined) return false;
  if (!moderates) return false;
  return moderates.some((m) => m.community.id === communityId);
}

export function parseJWT(payload: string): LemmyJWT {
  const base64 = payload.split(".")[1]!;
  const jsonPayload = atob(base64);
  return JSON.parse(jsonPayload);
}

const CROSS_POST_REGEX =
  /^[cC]ross-posted from:\s+(https:\/\/(?:[0-9a-z-]+\.?)+\/post\/[0-9]+)/;

export function getCrosspostUrl(post: Post): string | undefined {
  if (!post.body) return;

  const matches = post.body.match(CROSS_POST_REGEX);

  return matches?.[1];
}

export function buildCrosspostBody(post: Post): string {
  const header = `cross-posted from: ${post.ap_id}\n\n${quote(post.name)}`;

  if (!post.body) return header;

  return `${header}\n>\n${quote(post.body)}`;
}

export function getLoginErrorMessage(
  error: unknown,
  instanceActorId: string,
): string {
  if (!(error instanceof Error))
    return "Unknown error occurred, please try again.";

  switch (error.message as LemmyErrorValue) {
    // TODO old lemmy support
    case "incorrect_totp token" as OldLemmyErrorValue:
    case "incorrect_totp_token":
      return "Incorrect 2nd factor code. Please try again.";
    // TODO old lemmy support
    case "couldnt_find_that_username_or_email" as OldLemmyErrorValue:
    case "couldnt_find_person":
      return `User not found. Is your account on ${instanceActorId}?`;
    case "password_incorrect" as OldLemmyErrorValue:
    case "incorrect_login":
      return `Incorrect login credentials for ${instanceActorId}. Please try again.`;
    case "email_not_verified":
      return `Email not verified. Please check your inbox. Request a new verification email from https://${instanceActorId}.`;
    case "site_ban":
      return "You have been banned.";
    case "deleted":
      return "Account deleted.";
    default:
      return "Connection error, please try again.";
  }
}

export function isPost(item: PostView | CommentView): item is PostView {
  return !isComment(item);
}

export function isComment(item: PostView | CommentView): item is CommentView {
  return "comment" in item;
}

const getPublishedDate = (item: PostView | CommentView) => {
  if (isPost(item)) {
    return item.post.published;
  } else {
    return item.comment.published;
  }
};

export function sortPostCommentByPublished(
  a: PostView | CommentView,
  b: PostView | CommentView,
): number {
  return getPublishedDate(b).localeCompare(getPublishedDate(a));
}
