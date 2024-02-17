import { styled } from "@linaria/react";
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

    const protocolPrefix = url.protocol === "https:" ? "" : `${url.protocol}//`;
    const normalizedHost = (() => {
      if (protocolPrefix) return url.host;
      if (url.host.startsWith("www.")) return url.host.slice(4);

      return url.host;
    })();

    return [
      `${protocolPrefix}${normalizedHost}`,
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
