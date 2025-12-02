import { ClipboardEvent, KeyboardEvent, useRef } from "react";

import { extractLemmyLinkFromPotentialFediRedirectService } from "#/features/share/fediRedirect";
import { GO_VOYAGER_HOST } from "#/features/share/fediRedirect";
import { htmlToMarkdown } from "#/helpers/markdown";
import { parseUriList } from "#/helpers/url";

type TargetType = "markdown" | "url";

export function useOnPaste(targetType: TargetType) {
  const onPastePlainRef = useRef(false);

  function onKeyUpDown(e: KeyboardEvent) {
    // It's not enough to just check for shiftKey,
    // because iOS safari will return shiftKey=true when
    // <enter> or <space> is pressed (including on keyup).
    onPastePlainRef.current = e.shiftKey && (e.metaKey || e.ctrlKey);
  }

  function onPaste(e: ClipboardEvent) {
    // Bail on paste modifiers if user is holding down shift
    if (onPastePlainRef.current) return;

    const toInsert = attemptParseFromClipboard(e, targetType);
    if (!toInsert) return;

    e.preventDefault();
    document.execCommand("insertText", false, toInsert);
  }

  return {
    onKeyUpDown,
    onPaste,
  };
}

export function attemptParseFromClipboard(
  e: ClipboardEvent,
  targetType: TargetType,
) {
  return (
    (targetType === "markdown"
      ? attemptParseHtmlFromClipboard(e)
      : undefined) ||
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
