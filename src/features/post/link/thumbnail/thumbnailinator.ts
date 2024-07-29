import determineThumbnailForYoutube from "./sites/youtube";

export type Thumbnail =
  | string
  | {
      sm: string;
      lg: string;
    };

export async function determineThumbnail(
  url: string,
): Promise<Thumbnail | undefined> {
  const potentialYoutube = determineThumbnailForYoutube(url);

  if (potentialYoutube) return potentialYoutube;

  // Add more services here
}
