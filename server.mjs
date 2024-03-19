import express from "express";
import path from "path";

const CUSTOM_LEMMY_SERVERS = process.env.CUSTOM_LEMMY_SERVERS
  ? process.env.CUSTOM_LEMMY_SERVERS.split(",").map((s) => s.trim())
  : [];

const app = express();

app.get("/_config", (_, res) => {
  res.send({
    customServers: CUSTOM_LEMMY_SERVERS,
  });
});

const PORT = process.env.PORT || 5173;

// Tell search engines about new site
app.use("*", (req, res, next) => {
  if (req.hostname === "wefwef.app") {
    res.setHeader(
      "Link",
      `<https://vger.app${
        req.originalUrl === "/" ? "" : req.originalUrl
      }>; rel="canonical"`,
    );
  }

  next();
});

app.use(express.static(path.resolve(import.meta.dirname, "dist")));

app.get("*", function (_, res) {
  res.sendFile(path.resolve(import.meta.dirname, "dist", "index.html"));
});

app.listen(PORT, () =>
  // eslint-disable-next-line no-console
  console.log(`Server is on http://localhost:${PORT}`),
);
