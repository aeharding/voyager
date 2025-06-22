import { uniq } from "es-toolkit";

/**
 * 🚨 Want to add a server to this list?
 * Please read the [curated servers policy](./README.md) first.
 */
export const SERVERS_BY_CATEGORY = {
  general: [
    "lemmy.world",
    "lemmy.zip",
    "sh.itjust.works",
    "sopuli.xyz",
    "reddthat.com",
    "lemmy.today",
    "lemmings.world",
    "discuss.online",
    "lemmy.wtf",
    "lemmy.cafe",
    "lemy.lol",
    "thelemmy.club",
    "lemmy.myserv.one",
    "lemmus.org",
    "endlesstalk.org",
    "toast.ooo",
  ],
  regional: [
    "feddit.org",
    "lemmy.ca",
    "aussie.zone",
    "feddit.nl",
    "midwest.social",
    "feddit.it",
    "lemmy.eco.br",
    "szmer.info",
    "jlai.lu",
    "feddit.dk",
    "lemmy.nz",
    "feddit.nu",
    "feddit.cl",
    "lemmy.pt",
    "suppo.fi",
    "yall.theatl.social",
    "baraza.africa",
    "tucson.social",
    "real.lemmy.fan",
    "lemy.nl",
    "lemmy.eus",
    "dubvee.org",
    "feddit.uk",
  ],
  games: [
    "ttrpg.network",
    "mtgzone.com",
    "fanaticus.social",
    "dormi.zone",
    "eviltoast.org",
    "preserve.games",
  ],
  tech: [
    "futurology.today",
    "programming.dev",
    "discuss.tchncs.de",
    "lemmy.dbzer0.com",
    "eviltoast.org",
    "lemmy.kde.social",
    "lemmy.sdf.org",
    "linux.community",
    "infosec.pub",
    "lemdro.id",
  ],
  niche: [
    "sub.wetshaving.social",
    "startrek.website",
    "bookwormstory.social",
    "retrolemmy.com",
    "sffa.community",
    "lemmy.radio",
    "futurology.today",
    "adultswim.fan",
    "ani.social",
    "vegantheoryclub.org",
    "lemmy.vg",
  ],
  activism: ["rblind.com", "badatbeing.social", "slrpnk.net"],
  lgbt: ["lemmy.blahaj.zone"],
  academia: ["mander.xyz", "literature.cafe", "futurology.today"],
  furry: ["pawb.social", "yiffit.net"],
};

export const WHITELISTED_SERVERS = uniq(
  Object.values(SERVERS_BY_CATEGORY).flat(),
);

const PIEFED_INSTANCES = [
  "piefed.social",
  "preferred.social",
  "feddit.online",
  "piefed.blahaj.zone",
  "piefed.world",
  "piefed.zip",
  "piefed.ca",
  "feddit.fr",
];

const ADDITIONAL_LOGIN_INSTANCES = [
  ...PIEFED_INSTANCES,
  "lemmy.ml",
  "lemmygrad.ml",
  "lemmynsfw.com",
  "hexbear.net",
  "vger.social",
  "lemm.ee", // TODO: remove once lemm.ee is shut down (Jul 1st 2025)
];

export const LOGIN_SERVERS = uniq([
  ...WHITELISTED_SERVERS,
  ...ADDITIONAL_LOGIN_INSTANCES,
]);

export type ServerCategory = keyof typeof SERVERS_BY_CATEGORY | "recommended";
