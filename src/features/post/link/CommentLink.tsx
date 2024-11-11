import { LinkData } from "#/features/comment/CommentLinks";

import Link from "./Link";

interface CommentLinkProps {
  link: LinkData;
}

export default function CommentLink({ link }: CommentLinkProps) {
  return (
    <Link
      url={link.url}
      text={link.text && link.text !== link.url ? link.text : undefined}
      commentType={link.type}
      small
    />
  );
}
