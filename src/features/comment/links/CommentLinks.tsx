import { useMemo } from "react";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import remarkParse from "remark-parse";
import CommentLink from "./CommentLink";
import styled from "@emotion/styled";
import buildCommunityPlugin from "../../shared/markdown/buildCommunityPlugin";
import customRemarkGfm from "../../shared/markdown/customRemarkGfm";
import { useAppSelector } from "../../../store";
import { Link, Text } from "mdast";
import { uniqBy } from "lodash";
import { isValidUrl } from "../../../helpers/url";

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
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );

  const { showCommentImages } = useAppSelector(
    (state) => state.settings.general.comments,
  );

  const links = useMemo(() => {
    // Initialize a unified processor with the remark-parse parser

    const communityPlugin = buildCommunityPlugin(connectedInstance);

    // Parse the Markdown content
    const processor = unified()
      .use(remarkParse)
      .use([communityPlugin, customRemarkGfm]);

    const mdastTree = processor.parse(markdown);
    processor.runSync(mdastTree, markdown);

    let links: LinkData[] = [];

    visit(mdastTree, ["link", "image"], (_node) => {
      const node = _node as Link;

      if (node.type === "link" || (!showCommentImages && node.type === "image"))
        links.push({
          type: node.type,
          url: node.url,
          text: (node.children?.[0] as Text)?.value,
        });
    });

    // Remove mailto
    links = links.filter((link) => !link.url.startsWith("mailto:"));

    // Dedupe by url
    links = uniqBy(links, (l) => l.url);

    // e.g. `http://127.0.0.1:8080”`
    links = links.filter(({ url }) => isValidUrl(url));

    // Max 4 links
    links = links.slice(0, 4);

    return links;
  }, [markdown, connectedInstance]);

  if (!links.length) return;

  return (
    <Container>
      {links.map((link, index) => (
        <CommentLink link={link} key={index} />
      ))}
    </Container>
  );
}
