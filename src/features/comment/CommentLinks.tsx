import { unified } from "unified";
import { SKIP, visit } from "unist-util-visit";
import remarkParse from "remark-parse";
import CommentLink from "../post/link/CommentLink";
import { styled } from "@linaria/react";
import customRemarkGfm from "../shared/markdown/customRemarkGfm";
import { useAppSelector } from "../../store";
import { Text } from "mdast";
import { uniqBy } from "lodash";
import spoiler from "@aeharding/remark-lemmy-spoiler";
import { buildBaseLemmyUrl } from "../../services/lemmy";
import { defaultUrlTransform } from "react-markdown";
import { useMemo } from "react";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

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

  const links = useMemo(() => {
    const connectedInstanceUrl = buildBaseLemmyUrl(connectedInstance);

    // Initialize a unified processor with the remark-parse parser
    // and parse the Markdown content
    const processor = unified()
      .use(remarkParse)
      .use(customRemarkGfm, { connectedInstance })
      .use(spoiler);

    const mdastTree = processor.parse(markdown);
    processor.runSync(mdastTree, markdown);

    let links: LinkData[] = [];

    visit(mdastTree, ["details", "link", "image"], (node) => {
      // don't show links within spoilers
      if (node.type === "details") return SKIP;

      if (node.type === "link" || (!showCommentImages && node.type === "image"))
        links.push({
          type: node.type,
          // normalize relative links
          url: new URL(node.url, connectedInstanceUrl).href,
          text:
            "children" in node ? (node.children[0] as Text)?.value : undefined,
        });
    });

    // Dedupe by url
    links = uniqBy(links, (l) => l.url);

    // e.g. `http://127.0.0.1:8080”`
    links = links.filter(({ url }) => defaultUrlTransform(url));

    // Max 4 links
    links = links.slice(0, 4);

    return links.map((link, index) => <CommentLink link={link} key={index} />);
  }, [connectedInstance, markdown, showCommentImages]);

  if (!links.length) return;

  return <Container>{links}</Container>;
}
