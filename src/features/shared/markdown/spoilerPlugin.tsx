import { visit, SKIP } from "unist-util-visit";
import { Root, Node, Text, Html, Parent } from "mdast";

const splitSpoiler = (text: string): string[] => {
  const SPOILER_TITLE_REGEX = /^::: ?spoiler (.*?)$/m;
  const SPOILER_END_REGEX = /^:::$/m;
  const match_start = SPOILER_TITLE_REGEX.exec(text);
  const match_end = SPOILER_END_REGEX.exec(text);
  if (match_start) {
    const start = match_start.index;
    const end = start + match_start[0].length;
    console.log(start);
    console.log(end);
    return [text.slice(0, start > 0 ? start - 1 : 0), text.slice(start, end)].concat(splitSpoiler(text.slice(end + 1)));
  } else if (match_end) {
    const start = match_end.index;
    const end = start + match_end[0].length;
    return [text.slice(0, start - 1), text.slice(start, end)].concat(splitSpoiler(text.slice(end + 1)));
  }
  return [];
}

export default function spoilerPlugin() {
  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index: number | undefined, parent: Parent | undefined) => {
      let split = splitSpoiler(node.value);
      if (split.length > 0 && parent) {
        //console.log(split);
        parent.children.splice(index!, 1, ...split.map((text: string): Text => {
          return { type: 'text', value: text }
        }));
        // https://unifiedjs.com/learn/recipe/remove-node/#removing-a-node
        return [SKIP, index! + split.length];
      }
    });
  }
}
