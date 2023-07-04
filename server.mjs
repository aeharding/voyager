import express from "express";
import ViteExpress from "vite-express";
import { createProxyMiddleware } from "http-proxy-middleware";

const CUSTOM_LEMMY_SERVERS = process.env.CUSTOM_LEMMY_SERVERS
  ? process.env.CUSTOM_LEMMY_SERVERS.split(",").map((s) => s.trim())
  : [];

// avoid issues where popular servers are flakey
// and get blacklisted for a few minutes
const INITIAL_VALID_LEMMY_SERVERS = [
  "lemmy.ml",
  "lemmy.world",
  "lemmy.one",
  "beehaw.org",
  "sh.itjust.works",
  "lemm.ee",
  "feddit.de",
  "lemmy.blahaj.zone",
  "midwest.social",
  "lemmynsfw.com",
  "lemmy.ca",
  "lemmy.sdf.org",
].concat(CUSTOM_LEMMY_SERVERS);

const validLemmyServers = {};
const badLemmyServers = {};

INITIAL_VALID_LEMMY_SERVERS.forEach(
  (server) => (validLemmyServers[server] = true)
);

const app = express();

const PROXY_ENDPOINT = "/api/:actor";

app.use(PROXY_ENDPOINT, async (req, res, next) => {
  const actor = req.params.actor;

  if (typeof validLemmyServers[actor] === "object") {
    await validLemmyServers[actor];
  }

  if (validLemmyServers[actor] === true) return next();
  if (
    badLemmyServers[actor] &&
    Date.now() - 1_000 * 60 * 3 < badLemmyServers[actor]
  ) {
    res.status(400);
    res.send("not lemmy server");
    return;
  } else {
    delete badLemmyServers[actor];
  }

  const parsedActor = (() => {
    try {
      const { hostname } = new URL(`https://${actor}`);
      if (actor === hostname) return hostname;
    } catch (error) {
      console.error(`actor "${actor}" not valid hostname`);

      return undefined;
    }
  })();

  if (!parsedActor) {
    res.status(400);
    res.send("not lemmy server");
    return;
  }

  const nodeinfo = (async () => {
    try {
      const response = await fetch(`https://${actor}/nodeinfo/2.0.json`);

      return await response.json();
    } catch (error) {
      return {};
    }
  })();
  validLemmyServers[actor] = nodeinfo;

  const json = await nodeinfo;

  if (json?.software?.name === "lemmy") {
    validLemmyServers[actor] = true;
    return next();
  }

  badLemmyServers[actor] = Date.now();

  res.status(400);
  res.send("not lemmy server");
});

app.use(
  PROXY_ENDPOINT,
  createProxyMiddleware({
    target: "http://example.com",
    router: (req) => `https://${req.params.actor}`,
    changeOrigin: true,
    secure: true,
    xfwd: true,
    pathRewrite: (path) => path.split("/").slice(3).join("/"),
    onProxyReq: (clientReq, req) => {
      clientReq.setHeader(
        "user-agent",
        `(${req.hostname}, ${process.env.EMAIL || "hello@wefwef.app"})`
      );
      clientReq.removeHeader("cookie");

      // Fake it to get around Lemmy API connection issue
      clientReq.setHeader("origin", `https://${req.params.actor}`);

      // Hack to get around pictrs endpoint not allowing auth in pathname and/or body
      if (
        req.method === "POST" &&
        req.path === "pictrs/image" &&
        req.query?.auth
      ) {
        clientReq.setHeader("cookie", `jwt=${req.query.auth}`);
        delete req.query.auth;
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      res.removeHeader("cookie");
    },
  })
);

function transformer(html) {
  return html.replace(
    "<!-- runtime_config -->",
    `<script>${
      CUSTOM_LEMMY_SERVERS.length
        ? `window.CUSTOM_LEMMY_SERVERS = ${JSON.stringify(
            CUSTOM_LEMMY_SERVERS
          )}`
        : ""
    }</script>`
  );
}

ViteExpress.config({
  transformer,
});

const PORT = process.env.PORT || 5173;

ViteExpress.listen(app, PORT, () =>
  // eslint-disable-next-line no-console
  console.log(`Server is on http://localhost:${PORT}`)
);
