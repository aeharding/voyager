import { useMemo } from "react";
import { unified } from "unified";
import { SKIP, visit } from "unist-util-visit";
import remarkParse from "remark-parse";
import CommentLink from "../post/link/CommentLink";
import { styled } from "@linaria/react";
import customRemarkGfm from "../shared/markdown/customRemarkGfm";
import { useAppSelector } from "../../store";
import { Text } from "mdast";
import { uniqBy } from "lodash";
import { isValidUrl } from "../../helpers/url";
import spoiler from "@aeharding/remark-lemmy-spoiler";

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

  // Initialize a unified processor with the remark-parse parser
  // and parse the Markdown content
  const processor = unified()
    .use(remarkParse)
    .use(customRemarkGfm, { connectedInstance })
    .use(spoiler);

  const mdastTree = processor.parse(markdown);
  processor.runSync(mdastTree, markdown);

  let links: LinkData[] = [];

  visit(mdastTree, ["spoiler", "link", "image"], (node) => {
    // don't show links within spoilers
    if (node.type === "spoiler") return SKIP;

    if (node.type === "link" || (!showCommentImages && node.type === "image"))
      links.push({
        type: node.type,
        url: node.url,
        text:
          "children" in node ? (node.children[0] as Text)?.value : undefined,
      });
  });

  // Dedupe by url
  links = uniqBy(links, (l) => l.url);

  // e.g. `http://127.0.0.1:8080”`
  links = links.filter(({ url }) => isValidUrl(url));

  // Max 4 links
  links = links.slice(0, 4);

  if (!links.length) return;

  return (
    <Container>
      {links.map((link, index) => (
        <CommentLink link={link} key={index} />
      ))}
    </Container>
  );
}
