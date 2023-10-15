import styled from "@emotion/styled";
import { useMemo } from "react";

const Rest = styled.span`
  opacity: 0.6;
`;

interface UrlProps {
  children: string;
}

export default function Url({ children }: UrlProps) {
  const [domain, rest] = useMemo(() => {
    const url = new URL(children);

    return [
      `${url.protocol}//${url.host}`,
      `${url.pathname}${url.search}${url.hash}`,
    ];
  }, [children]);

  return (
    <>
      {domain}
      {rest !== "/" ? <Rest>{rest}</Rest> : ""}
    </>
  );
}
