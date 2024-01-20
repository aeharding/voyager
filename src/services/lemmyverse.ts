// Incomplete
export interface LVInstance {
  baseurl: string;
  url: string;
  name: string;
  desc: string;
  downvotes: boolean;
  nsfw: boolean;
  create_admin: boolean;
  private: boolean;
  fed: boolean;
  version: string;
  open: boolean;
  langs: string[];
  date: string;
  published: number;
  time: number;
  score: number;
  tags: string[];
  icon?: string;
  banner?: string;
  trust: {
    score: number;
  };
}

export async function getFullList(): Promise<LVInstance[]> {
  const data = await fetch(
    "https://data.lemmyverse.net/data/instance.full.json",
  );

  return await data.json();
}
