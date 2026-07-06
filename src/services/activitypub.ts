import platformFetch from "./platformFetch";

export default async function resolveFedilink(
  url: string,
  requestInit: Pick<RequestInit, "signal">,
): Promise<string> {
  const response = await platformFetch(url, {
    ...requestInit,
    headers: { Accept: "application/activity+json" },
  });

  const data = await response.json();

  if (!response.ok || !data.id) {
    throw new Error("Failed to get AP ID");
  }

  return data.id;
}
