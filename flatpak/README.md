# Flatpak packaging

Flathub builds are fully offline: `cargo-sources.json` and
`node-sources.json` pin every dependency from the lockfiles.

They are not committed on main. Release CI generates and commits them
into each release tag (alongside `.env`), so the flathub repo copies exact
per-release sources from the tag. PR CI regenerates them on the fly to
validate dependency changes. For a manual/local run:

```sh
docker run --rm -v "$PWD":/w python:3.12-slim bash -c \
  'apt-get update -qq && apt-get install -y -qq git curl && bash /w/flatpak/generate-sources.sh /w'
```
