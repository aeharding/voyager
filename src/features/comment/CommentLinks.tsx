import { useMemo } from "react";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import remarkParse from "remark-parse";
import CommentLink from "./CommentLink";
import styled from "@emotion/styled";
import buildCommunityPlugin from "../shared/markdown/buildCommunityPlugin";
import customRemarkGfm from "../shared/markdown/customRemarkGfm";
import { useAppSelector } from "../../store";
import { Link, Text } from "mdast";

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

  const links = useMemo(() => {
    // Initialize a unified processor with the remark-parse parser

    const communityPlugin = buildCommunityPlugin(connectedInstance);

    // Parse the Markdown content
    const ast = unified()
      .use(remarkParse as never)
      .use([communityPlugin, customRemarkGfm])
      .parse(markdown);

    const links: LinkData[] = [];

    visit(ast, ["link", "image"], (_node) => {
      const node = _node as Link;

      if (node.type === "link" || node.type === "image")
        links.push({
          type: node.type,
          url: node.url,
          text: (node.children?.[0] as Text)?.value,
        });
    });

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
