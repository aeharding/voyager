export async function resolveSoftware(
  url: string,
): Promise<Nodeinfo21Payload["software"]> {
  const response = await fetch(`${url}/.well-known/nodeinfo`, {
    headers: { Accept: "application/json" },
  });

  const data = await response.json();

  const nodeinfoLink = resolveNodeinfoLink(data);

  if (nodeinfoLink) {
    const nodeinfoResponse = await fetch(nodeinfoLink);

    const nodeinfoData = (await nodeinfoResponse.json()) as Nodeinfo21Payload;

    return nodeinfoData.software;
  }

  throw new Error(
    "No supported nodeinfo (http://nodeinfo.diaspora.software/ns/schema/2.1) found",
  );
}

interface NodeinfoLink {
  rel: string;
  href: string;
}

interface NodeinfoLinksPayload {
  links: NodeinfoLink[];
}

// {"links":[{"rel":"http://nodeinfo.diaspora.software/ns/schema/2.1","href":"https://lemmy.zip/nodeinfo/2.1"}]}
function resolveNodeinfoLink(data: NodeinfoLinksPayload): string | undefined {
  return data.links.find(
    (link) => link.rel === "http://nodeinfo.diaspora.software/ns/schema/2.1",
  )?.href;
}

export interface Nodeinfo21Payload {
  software: {
    name: string;
    version: string;
  };
}
