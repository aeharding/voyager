/// <reference types="mdast-util-lemmy-spoiler" />
import { Root } from "mdast";
import { visit } from "unist-util-visit";

/**
 * Transform spoiler tree node to details/summary rehype html nodes
 */
export default function inlinifySpoiler() {
  return function (tree: Root) {
    visit(tree, "summary", function (node, _, parent) {
      if (!parent) return;
      if (parent.type !== "details") return;

      parent.data = { hName: "p" };
      parent.children = node.children;
    });
  };
}
