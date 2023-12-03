/// <reference types="remark-stringify" />

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
import type { Options } from "remark-gfm";

export default function customRemarkGfm(
  this: import("unified").Processor,
  options = {},
) {
  const settings = options;
  const data = this.data();

  const micromarkExtensions =
    data.micromarkExtensions || (data.micromarkExtensions = []);
  const fromMarkdownExtensions =
    data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);
  const toMarkdownExtensions =
    data.toMarkdownExtensions || (data.toMarkdownExtensions = []);

  micromarkExtensions.push(gfm(settings));
  fromMarkdownExtensions.push(gfmFromMarkdown());
  toMarkdownExtensions.push(gfmToMarkdown(settings));
}

function gfm(options?: Options) {
  return combineExtensions([gfmStrikethrough(options), gfmTable()]);
}

function gfmFromMarkdown() {
  return [
    gfmAutolinkLiteralFromMarkdown(),
    gfmStrikethroughFromMarkdown(),
    gfmTableFromMarkdown(),
  ];
}

function gfmToMarkdown(options?: Options) {
  return {
    extensions: [
      gfmAutolinkLiteralToMarkdown(),
      gfmStrikethroughToMarkdown(),
      gfmTableToMarkdown(options),
    ],
  };
}
