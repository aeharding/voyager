import nativeFetch from "./nativeFetch";

export async function getVideo(id: string): Promise<string> {
  // Look in HTML for 'video-src="https://loopsusercontent.com/videos/79931285677674496/80152638884286464/L3OUSQwlCnSPbcQnDk67zsARinU41SaLDh0OY617.720p.mp4"'

  const res = await nativeFetch(`https://loops.video/v/${id}`);

  const html = await res.text();

  const videoSrcMatch = html.match(/video-src="([^"]+)"/);

  if (!videoSrcMatch?.[1]) throw new Error("No video src found");

  return videoSrcMatch[1];
}
