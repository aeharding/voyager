import spoiler from "@aeharding/remark-lemmy-spoiler";
import { Text } from "mdast";
import { defaultUrlTransform } from "react-markdown";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { CONTINUE, EXIT, SKIP, visit } from "unist-util-visit";

import CommentLink from "#/features/post/link/CommentLink";
import customRemarkGfm from "#/features/shared/markdown/customRemarkGfm";
import { parseUrl } from "#/helpers/url";
import { buildBaseLemmyUrl } from "#/services/lemmy";
import { useAppSelector } from "#/store";

import styles from "./CommentLinks.module.css";

export interface LinkData {
  type: "link" | "image";
  url: string;
  text?: string;
}

interface CommentLinksProps {
  markdown: string;
}

export default function CommentLinks({ markdown }: CommentLinksProps) {
  const { showCommentImages } = useAppSelector(
    (state) => state.settings.general.comments,
  );
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );

  const links = (() => {
    const connectedInstanceUrl = buildBaseLemmyUrl(connectedInstance);

    // Initialize a unified processor with the remark-parse parser
    // and parse the Markdown content
    const processor = unified()
      .use(remarkParse)
      .use(customRemarkGfm, { connectedInstance })
      .use(spoiler);

    const mdastTree = processor.parse(markdown);
    processor.runSync(mdastTree, markdown);

    const links: LinkData[] = [];
    const urlMap = new Map<string, true>();

    visit(mdastTree, ["details", "link", "image"], (node) => {
      // don't show links within spoilers
      if (node.type === "details") return SKIP;

      if (
        node.type === "link" ||
        (!showCommentImages && node.type === "image")
      ) {
        const url = parseUrl(node.url, connectedInstanceUrl)?.href;

        // Skip if not a valid URL
        if (!url) return CONTINUE;

        // Skip if the URL is not a valid URL,
        // according to default markdown link parser logic
        if (!defaultUrlTransform(url)) return CONTINUE;

        // Skip if the URL has already been added
        if (urlMap.has(url)) return CONTINUE;

        urlMap.set(url, true);

        links.push({
          type: node.type,
          // normalize relative links
          url,
          text:
            "children" in node ? (node.children[0] as Text)?.value : undefined,
        });

        if (links.length === 4) return EXIT;
      }
    });

    return links.map((link, index) => <CommentLink link={link} key={index} />);
  })();

  if (!links.length) return;

  return <div className={styles.container}>{links}</div>;
}
