import { uniq } from "es-toolkit";

/**
 * 🚨 Want to add a server to this list?
 * Please read the [curated servers policy](./README.md) first.
 */
export const SERVERS_BY_CATEGORY = {
  general: [
    "lemmy.world",
    "lemm.ee",
    "sh.itjust.works",
    "sopuli.xyz",
    "reddthat.com",
    "lemmy.zip",
    "lemmy.one",
    "lemmy.today",
    "lemmings.world",
    "discuss.online",
    "lemmus.org",
    "lemmy.wtf",
    "lemy.lol",
    "thelemmy.club",
    "lemmy.cafe",
    "toast.ooo",
    "endlesstalk.org",
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

const ADDITIONAL_LOGIN_INSTANCES = [
  "lemmy.ml",
  "lemmygrad.ml",
  "lemmynsfw.com",
  "hexbear.net",
  "vger.social",
  "lemmy.myserv.one",
];

export const LOGIN_SERVERS = uniq([
  ...WHITELISTED_SERVERS,
  ...ADDITIONAL_LOGIN_INSTANCES,
]);

export type ServerCategory = keyof typeof SERVERS_BY_CATEGORY | "recommended";
