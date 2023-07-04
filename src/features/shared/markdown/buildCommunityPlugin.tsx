import { Plugin, Transformer } from "unified";
import { visit } from "unist-util-visit";
import { Parent, Text, Link } from "mdast";

interface CustomNode extends Text {}

interface CustomLink extends Link {
  url: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CustomTransformer = Transformer<any, any>;

export default function buildCommunityPlugin(connectedInstance: string) {
  const communityPlugin: Plugin<[]> = (): CustomTransformer => {
    const transformer: CustomTransformer = (tree) => {
      const visitor = (
        node: CustomNode | Parent,
        index: number | null,
        parent: Parent | undefined
      ) => {
        if (node?.type === "text" && parent) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { value } = node as any;

          const regex = /!([\w-]+)@([^\s.,!?;)]+(?:\.[^\s.,!?;=)]+)+)/g;
          let match;
          let lastIndex = 0;
          const newTextNodes: (Text | CustomLink)[] = [];

          while ((match = regex.exec(value))) {
            const [fullMatch, communityHandle, handleDomain] = match;
            const start = match.index;
            const end = start + fullMatch.length;

            const before = value.slice(lastIndex, start);

            const atDomain =
              connectedInstance === handleDomain ? "" : `@${handleDomain}`;
            const url =
              `https://${connectedInstance}/c/${communityHandle}${atDomain}`;

            // Prevents double-nesting of links.
            if (parent.type === "link" && parent.url === url) {
              continue
            }

            if (before) {
              newTextNodes.push({ type: "text", value: before });
            }

            const linkNode: CustomLink = {
              type: "link",
              url,
              children: [
                {
                  type: "text",
                  value: fullMatch,
                },
              ],
            };

            newTextNodes.push(linkNode);

            lastIndex = end;
          }

          if (newTextNodes.length > 0) {
            if (lastIndex < value.length) {
              newTextNodes.push({
                type: "text",
                value: value.slice(lastIndex),
              });
            }

            if (index !== null) {
              parent.children.splice(index, 1, ...newTextNodes);
            } else {
              parent.children.push(...newTextNodes);
            }
          }
        }
      };

      visit(tree, "text", (node, index, parent) =>
        visitor(node as CustomNode, index, parent as Parent)
      );
    };

    return transformer;
  };

  return communityPlugin;
}
