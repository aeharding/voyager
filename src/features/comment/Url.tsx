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
    let url;

    try {
      url = new URL(children);
    } catch (error) {
      console.error(error);
      return [];
    }

    return [
      `${url.protocol}//${url.host}`,
      `${url.pathname}${url.search}${url.hash}`,
    ];
  }, [children]);

  if (!domain || !rest) return;

  return (
    <>
      {domain}
      {rest !== "/" ? <Rest>{rest}</Rest> : ""}
    </>
  );
}
