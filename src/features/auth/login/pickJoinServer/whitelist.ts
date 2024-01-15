import { uniq } from "lodash";

export const REGIONAL = [
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
];

export const GENERAL = [
  "lemmy.world",
  "lemm.ee",
  //   "lemmy.ml",
  "sh.itjust.works",
  "sopuli.xyz",
  "reddthat.com",
  "lemmy.zip",
  "lemmings.world",
  "discuss.online",
  "lemmus.org",
  "lemmy.wtf",
  "lemy.lol",
  "thelemmy.club",
  "lemmy.cafe",
  "endlesstalk.org",
];

export const GAMES = [
  "ttrpg.network",
  "mtgzone.com",
  "fanaticus.social",
  "dormi.zone",
  "eviltoast.org",
  "preserve.games",
  "derpzilla.net",
];

export const TECH = [
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
];

export const NICHE = [
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
];

export const ACTIVISM = [
  "rblind.com",
  "badatbeing.social",
  "beehaw.org",
  "sirpnk.net",
  "merv.news",
];

export const LGBT = ["femboys.bar", "transfem.space", "lemmy.blahaj.zone"];

export const ACADEMIA = ["mander.xyz", "literature.cafe", "futurology.today"];

export const FURRY = ["pawb.social", "yiffit.net"];

export const WHITELISTED_INSTANCES = uniq([
  ...GENERAL,
  ...REGIONAL,
  ...GAMES,
  ...TECH,
  ...NICHE,
  ...ACTIVISM,
  ...LGBT,
  ...ACADEMIA,
  ...FURRY,
]);

const ADDITIONAL_LOGIN_INSTANCES = ["lemmy.ml", "lemmygrad.ml", "hexbear.net"];

export const LOGIN_INSTANCES = uniq([
  ...WHITELISTED_INSTANCES,
  ...ADDITIONAL_LOGIN_INSTANCES,
]);

export const SERVERS_BY_CATEGORY = {
  general: GENERAL,
  regional: REGIONAL,
  games: GAMES,
  tech: TECH,
  niche: NICHE,
  activism: ACTIVISM,
  lgbt: LGBT,
  academia: ACADEMIA,
  furry: FURRY,
};

export type ServerCategory = keyof typeof SERVERS_BY_CATEGORY | "recommended";
