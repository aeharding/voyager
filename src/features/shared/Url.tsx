import { styled } from "@linaria/react";
import { useMemo } from "react";
import { parseUrlForDisplay } from "../../helpers/url";

const Rest = styled.span`
  opacity: 0.6;
`;

interface UrlProps {
  children: string;
}

export default function Url({ children }: UrlProps) {
  const [domain, rest] = useMemo(
    () => parseUrlForDisplay(children),
    [children],
  );

  if (!domain || !rest) return;

  return (
    <>
      {domain}
      {rest !== "/" ? <Rest>{rest}</Rest> : ""}
    </>
  );
}
