import { combineExtensions } from "micromark-util-combine-extensions";
import { gfmStrikethrough } from "micromark-extension-gfm-strikethrough";
import { gfmTable } from "micromark-extension-gfm-table";
import {
  gfmAutolinkLiteralFromMarkdown,
  gfmAutolinkLiteralToMarkdown,
} from "mdast-util-gfm-autolink-literal-lemmy";
import {
  gfmStrikethroughFromMarkdown,
  gfmStrikethroughToMarkdown,
} from "mdast-util-gfm-strikethrough";
import { gfmTableFromMarkdown, gfmTableToMarkdown } from "mdast-util-gfm-table";
import { Options } from "remark-gfm";

export default function customRemarkGfm(
  this: import("unified").Processor,
  options = {},
) {
  const data = this.data();

  add("micromarkExtensions", gfm());
  add("fromMarkdownExtensions", gfmFromMarkdown());
  add("toMarkdownExtensions", gfmToMarkdown(options));

  function add(field: string, value: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const list: any = data[field] ? data[field] : (data[field] = []);

    list.push(value);
  }
}

function gfm(options?: Options) {
  return combineExtensions([gfmStrikethrough(options), gfmTable()]);
}

function gfmFromMarkdown() {
  return [
    gfmAutolinkLiteralFromMarkdown,
    gfmStrikethroughFromMarkdown,
    gfmTableFromMarkdown,
  ];
}

function gfmToMarkdown(options?: Options) {
  return {
    extensions: [
      gfmAutolinkLiteralToMarkdown,
      gfmStrikethroughToMarkdown,
      gfmTableToMarkdown(options),
    ],
  };
}
