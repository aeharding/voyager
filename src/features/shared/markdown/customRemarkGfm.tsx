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
import { Settings } from "unified";

interface Options {
  connectedInstance: string;
}

export default function customRemarkGfm(
  this: import("unified").Processor,
  options: Options,
) {
  const data = this.data();

  const micromarkExtensions =
    data.micromarkExtensions || (data.micromarkExtensions = []);
  const fromMarkdownExtensions =
    data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);
  const toMarkdownExtensions =
    data.toMarkdownExtensions || (data.toMarkdownExtensions = []);

  micromarkExtensions.push(gfm());
  fromMarkdownExtensions.push(gfmFromMarkdown(options));
  toMarkdownExtensions.push(gfmToMarkdown() as Settings);
}

function gfm() {
  return combineExtensions([gfmStrikethrough(), gfmTable()]);
}

function gfmFromMarkdown({ connectedInstance }: Options) {
  return [
    gfmAutolinkLiteralFromMarkdown({ connectedInstance }),
    gfmStrikethroughFromMarkdown(),
    gfmTableFromMarkdown(),
  ];
}

function gfmToMarkdown() {
  return {
    extensions: [
      gfmAutolinkLiteralToMarkdown(),
      gfmStrikethroughToMarkdown(),
      gfmTableToMarkdown(),
    ],
  };
}
