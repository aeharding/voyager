import { Root, Node, Element, Text, ElementContent } from "hast";

const isElement = (node: Node): node is Element => (node.type == 'element') ? true : false;
const isText = (node: Node): node is Text => (node.type == 'text') ? true : false;
const SPOILER_TITLE_REGEX = /^::: ?spoiler (.*?)$/m;


export function customRehypeSpoiler() {
  return (tree: Root) => {
    // go through the lsit
    let starts: number[] = [];
    let ends: number[] = [];
    for (let i = 0; i < tree.children.length; i++) {
      const node = tree.children[i];
      // get start and end indexes
      if (
        isElement(node) &&
        node.children.length != 0 &&
        node.children != undefined &&
        isText(node.children[0])
      ) {
        if (
          node.children[0].value.startsWith(":::spoiler") ||
          node.children[0].value.startsWith("::: spoiler")
        ) {
          starts.push(i);
        } else if (node.children[0].value == ':::') {
          ends.push(i);
        }
      }
    }
    console.log(starts, ends);
    while (starts.length > 0 && ends.length > 0) {
      console.log(tree.children[starts[0]]);
      let spoilerTitle = SPOILER_TITLE_REGEX.exec(((tree.children[starts[0]] as Element).children[0] as Text).value);
      const start = starts[0];
      tree.children.splice(start, 1, {
        type: 'element',
        tagName: 'a',
        properties: {
          href: 'https://spoiler', // Need a valid URL here
          title: spoilerTitle![1],
        },
        children: [],
      });
      let spoiler = tree.children[start]
      let spoilerLength = ends[0] - starts[0] + 1;
      console.log(spoilerLength);
      // set children and splice
      if (isElement(spoiler)) {
        spoiler.children = tree.children.splice(start + 1, spoilerLength).slice(0, -2) as ElementContent[];
      }
      // fix list indexes ig
      starts.shift();
      const end = ends.shift()!;
      starts = starts.map((index: number): number => {
        if (index < start) return index;
        else if (index > end) return index - spoilerLength;
        return -1;
      }).filter((index) => index >= 0);
      ends = ends.map((index: number): number => {
        if (index < start) return index;
        else if (index > end) return index - spoilerLength;
        return -1;
      }).filter((index) => index >= 0);
      console.log(starts, ends)
    }
    console.log(tree);
  }
}
