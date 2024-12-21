import { parseUrlForDisplay } from "#/helpers/url";

interface UrlProps {
  children: string;
}

export default function Url({ children }: UrlProps) {
  const [domain, rest] = parseUrlForDisplay(children);

  if (!domain || !rest) return;

  return (
    <>
      {domain}
      {rest !== "/" ? <span style={{ opacity: 0.6 }}>{rest}</span> : ""}
    </>
  );
}
