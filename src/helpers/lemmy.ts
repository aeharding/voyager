import {
  Comment,
  CommentView,
  Community,
  GetSiteResponse,
} from "lemmy-js-client";

export const LEMMY_SERVERS =
  "CUSTOM_LEMMY_SERVERS" in window
    ? (window.CUSTOM_LEMMY_SERVERS as string[])
    : ["lemmy.world", "lemmy.ml", "beehaw.org", "sh.itjust.works"];

export interface LemmyJWT {
  sub: number;
  iss: string; // e.g. "lemmy.ml"
  iat: number;
}

export interface CommentNodeI {
  comment_view: CommentView;
  children: Array<CommentNodeI>;
  depth: number;
}

export const MAX_DEFAULT_COMMENT_DEPTH = 5;

/**
 * @param item Community, Person, etc
 */
export function getItemActorName(item: Pick<Community, "actor_id">) {
  return new URL(item.actor_id).hostname;
}

export function checkIsMod(communityHandle: string, site: GetSiteResponse) {
  return site?.my_user?.moderates.find(
    (m) => getHandle(m.community) === communityHandle
  );
}

/**
 * @param item Community, Person, etc
 */
export function getHandle(
  item: Pick<Community, "name" | "actor_id" | "local">
) {
  return item.local ? item.name : getRemoteHandle(item);
}

export function getRemoteHandle(
  item: Pick<Community, "name" | "actor_id" | "local">
) {
  return `${item.name}@${getItemActorName(item)}`;
}

export function canModify(comment: CommentView) {
  return !comment.comment.deleted && !comment.comment.removed;
}

export function buildCommentsTree(
  comments: CommentView[],
  parentComment: boolean
): CommentNodeI[] {
  const map = new Map<number, CommentNodeI>();
  const depthOffset = !parentComment
    ? 0
    : getDepthFromComment(comments[0].comment) ?? 0;

  for (const comment_view of comments) {
    const depthI = getDepthFromComment(comment_view.comment) ?? 0;
    const depth = depthI ? depthI - depthOffset : 0;
    const node: CommentNodeI = {
      comment_view,
      children: [],
      depth,
    };
    map.set(comment_view.comment.id, { ...node });
  }

  const tree: CommentNodeI[] = [];

  // if its a parent comment fetch, then push the first comment to the top node.
  if (parentComment) {
    const cNode = map.get(comments[0].comment.id);
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

export function getCommentParentId(comment?: Comment): number | undefined {
  const split = comment?.path.split(".");
  // remove the 0
  split?.shift();

  return split && split.length > 1
    ? Number(split.at(split.length - 2))
    : undefined;
}

export function getDepthFromComment(comment?: Comment): number | undefined {
  const len = comment?.path.split(".").length;
  return len ? len - 2 : undefined;
}

export function insertCommentIntoTree(
  tree: CommentNodeI[],
  cv: CommentView,
  parentComment: boolean
) {
  // Building a fake node to be used for later
  const node: CommentNodeI = {
    comment_view: cv,
    children: [],
    depth: 0,
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
  id: number
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

/**
 * NOTE: This assumes NO missing siblings
 */
export function countMissingDirectChildComments(
  commentNode: CommentNodeI
): number {
  if (commentNode.children.length) {
    return 0;
  }

  return commentNode.comment_view.counts.child_count;
}

export function isUrlImage(url: string): boolean {
  let parsedUrl;

  try {
    parsedUrl = new URL(url);
  } catch (error) {
    console.error(error);
    return false;
  }

  return (
    parsedUrl.pathname.endsWith(".jpeg") ||
    parsedUrl.pathname.endsWith(".png") ||
    parsedUrl.pathname.endsWith(".gif") ||
    parsedUrl.pathname.endsWith(".jpg") ||
    parsedUrl.pathname.endsWith(".webp")
  );
}

export function isUrlVideo(url: string): boolean {
  let parsedUrl;

  try {
    parsedUrl = new URL(url);
  } catch (error) {
    console.error(error);
    return false;
  }

  return parsedUrl.pathname.endsWith(".mp4");
}
