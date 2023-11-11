export { customRehypeSpoiler } from "./spoilerRehype";
export type { spoilerProps } from "./spoilerRehype";
export { customRemarkSpoiler };

import { visit, SKIP } from "unist-util-visit";
import { Root, Text, Parent, Paragraph, Node, PhrasingContent } from "mdast";

/**
 * Given a piece of text, seperate the spoiler tokens and returns text split into list.
 */
const splitSpoiler = (text: string): string[] => {
  const SPOILER_TITLE_REGEX = /^::: ?spoiler (.*?)$/m;
  const SPOILER_END_REGEX = /^:::$/m;
  const match_start = SPOILER_TITLE_REGEX.exec(text);
  const match_end = SPOILER_END_REGEX.exec(text);
  if (match_start) {
    const start = match_start.index;
    const end = start + match_start[0].length;
    return [text.slice(0, start > 0 ? start - 1 : 0), text.slice(start, end)].concat(splitSpoiler(text.slice(end + 1)));
  } else if (match_end) {
    const start = match_end.index;
    const end = start + match_end[0].length;
    return [text.slice(0, start - 1), text.slice(start, end)].concat(splitSpoiler(text.slice(end + 1)));
  }
  return [text];
}

const isText = (node: Node): node is Text => (node.type == 'text') ? true : false;

/**
 * Remark plugin to identify spoiler tokens. Seperates spoiler tokens into
 * their own paragraphs for further parsing by the Rehype plugin.
 */
function customRemarkSpoiler() {
  return (tree: Root) => {
    // TODO: change to paragraph!!
    visit(tree, 'paragraph', (parent: Paragraph, index: number | undefined, root: Parent | undefined) => {
      let i = 0;
      while (i < parent.children.length) {
        let node = parent.children[i];
        if (isText(node)) {
          let split = splitSpoiler(node.value);
          if (parent != undefined && i != undefined) {
            parent.children.splice(i, 1, ...split.map((text: string): Text => {
              return { type: 'text', value: text };
            }));
            // Jump to the next node
            i = i + split.length;
          } else i++;
        } else i++;
      }
      if (root != undefined && index != undefined) {
        const splitTags: Paragraph[] = parent.children.reduce((acc: Node[][], node: Node): Node[][] => {
          if (isText(node) && node.value.startsWith(":::")) {
            acc = acc.concat([[node], []]);
          } else acc.at(-1)!.push(node);
          return acc;
        }, [[]]).map(((nodes: Node[]): Paragraph => {
          return { type: 'paragraph', children: nodes as PhrasingContent[] };
        }));
        root.children.splice(index, 1, ...splitTags);
        return [SKIP, index + splitTags.length];
      }
    });
  }
}

