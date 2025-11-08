import { ClipboardEvent } from "react";

import { extractLemmyLinkFromPotentialFediRedirectService } from "#/features/share/fediRedirect";
import { GO_VOYAGER_HOST } from "#/features/share/fediRedirect";
import { htmlToMarkdown } from "#/helpers/markdown";
import { parseUriList } from "#/helpers/url";

export function attemptParseFromClipboard(e: ClipboardEvent) {
  return (
    attemptParseHtmlFromClipboard(e) ||
    attemptParseUrlFromClipboard(e) ||
    attemptParseTextFromClipboard(e)
  );
}

function attemptParseHtmlFromClipboard(e: ClipboardEvent) {
  const html = e.clipboardData.getData("text/html");

  if (!html) return;

  try {
    return htmlToMarkdown(html);
  } catch (error) {
    console.error("Parse error", error);
    return;
  }
}

function attemptParseUrlFromClipboard(e: ClipboardEvent) {
  const uriList = e.clipboardData.getData("text/uri-list");

  if (!uriList) return;

  const urls = parseUriList(uriList);

  if (urls.length !== 1) return;

  return extractLemmyLinkFromPotentialFediRedirectService(urls[0]!, [
    GO_VOYAGER_HOST,
  ]);
}

function attemptParseTextFromClipboard(e: ClipboardEvent) {
  const text = e.clipboardData.getData("text");

  if (!text) return;

  return extractLemmyLinkFromPotentialFediRedirectService(text, [
    GO_VOYAGER_HOST,
  ]);
}
