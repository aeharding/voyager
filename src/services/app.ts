const DEFAULT_LEMMY_SERVERS = [
  "lemmy.world",
  "lemmy.ml",
  "beehaw.org",
  "sh.itjust.works",
];

let _customServers = DEFAULT_LEMMY_SERVERS;

export function getCustomServers() {
  return _customServers;
}

export function getDefaultServer() {
  return _customServers[0];
}

export default async function getConfig() {
  const response = await fetch("/_config");

  const { customServers } = await response.json();

  if (customServers?.length) {
    _customServers = customServers;
  }
}
