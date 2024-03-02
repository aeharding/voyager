/// <reference types="mdast-util-lemmy-spoiler" />

import { visit } from "unist-util-visit";
import { Root } from "mdast";

/**
 * Transform spoiler tree node to details/summary rehype html nodes
 *
 * TODO this may not be necessary if the logic can be moved to mdast-util-lemmy-spoiler
 * https://github.com/orgs/micromark/discussions/163
 */
export default function spoilerRehype() {
  return function (tree: Root) {
    visit(tree, function (node) {
      if (node.type === "spoiler") {
        const data = node.data || (node.data = {});
        data.hName = "details";

        node.children = [
          {
            type: "paragraph",
            data: {
              hName: "summary",
            },
            children: [
              {
                type: "text",
                value: node.name,
              },
            ],
          },
          ...node.children,
        ];
      }
    });
  };
}
