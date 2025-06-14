export default async function getAPId(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { Accept: "application/activity+json" },
  });

  const data = await response.json();

  if (!response.ok || !data.id) {
    throw new Error("Failed to get AP ID");
  }

  return data.id;
}
