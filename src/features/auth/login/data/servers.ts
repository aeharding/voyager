import { concat, uniq } from "lodash";

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
    "endlesstalk.org",
  ],
  regional: [
    "feddit.de",
    "lemmy.ca",
    "aussie.zone",
    "feddit.nl",
    "midwest.social",
    "feddit.it",
    "lemmy.eco.br",
    "szmer.info",
    "feddit.ch",
    "jlai.lu",
    "feddit.dk",
    "lemmy.nz",
    "feddit.nu",
    "feddit.cl",
    "lemmy.pt",
    "dmv.social",
    "suppo.fi",
    "yall.theatl.social",
    "feddit.ro",
    "baraza.africa",
    "tucson.social",
    "real.lemmy.fan",
    "lemy.nl",
    "lemmy.eus",
    "dubvee.org",
    "lemmy.id",
    "lemmy.bleh.au",
    "feddit.uk",
  ],
  games: [
    "ttrpg.network",
    "mtgzone.com",
    "fanaticus.social",
    "dormi.zone",
    "eviltoast.org",
    "preserve.games",
    "derpzilla.net",
  ],
  tech: [
    "futurology.today",
    "programming.dev",
    "discuss.tchncs.de",
    "lemmy.dbzer0.com",
    "eviltoast.org",
    "lemmy.kde.social",
    "lemmy.sdf.org",
    "lemmyhub.com",
    "linux.community",
    "infosec.pub",
    "iusearchlinux.fyi",
    "derpzilla.net",
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
    "lemmy.radio",
    "psychedelia.ink",
    "ani.social",
  ],
  activism: [
    "rblind.com",
    "badatbeing.social",
    "beehaw.org",
    "sirpnk.net",
    "merv.news",
  ],
  lgbt: ["femboys.bar", "transfem.space", "lemmy.blahaj.zone"],
  academia: ["mander.xyz", "literature.cafe", "futurology.today"],
  furry: ["pawb.social", "yiffit.net"],
};

export const WHITELISTED_SERVERS = uniq(
  concat(...Object.values(SERVERS_BY_CATEGORY)),
);

const ADDITIONAL_LOGIN_INSTANCES = [
  "lemmy.ml",
  "lemmygrad.ml",
  "lemmynsfw.com",
  "hexbear.net",
];

export const LOGIN_SERVERS = uniq([
  ...WHITELISTED_SERVERS,
  ...ADDITIONAL_LOGIN_INSTANCES,
]);

export type ServerCategory = keyof typeof SERVERS_BY_CATEGORY | "recommended";
