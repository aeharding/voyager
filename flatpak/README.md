# Flatpak packaging

Flathub builds are fully offline: `cargo-sources.json` and
`node-sources.json` pin every dependency from the lockfiles.

They are not committed on main. Release CI generates and commits them
into each release tag (alongside `.env`), so the flathub repo copies exact
per-release sources from the tag. PR CI regenerates them on the fly to
validate dependency changes. For a manual/local run:

```sh
docker run --rm -v "$PWD":/w python:3.12-slim sh -c '
  apt-get update -qq && apt-get install -y -qq git &&
  pip install -q aiohttp tomlkit \
    "git+https://github.com/flatpak/flatpak-builder-tools.git#subdirectory=node" &&
  curl -s https://raw.githubusercontent.com/flatpak/flatpak-builder-tools/master/cargo/flatpak-cargo-generator.py -o /tmp/fcg.py &&
  python /tmp/fcg.py /w/src-tauri/Cargo.lock -o /w/flatpak/cargo-sources.json &&
  flatpak-node-generator pnpm /w/pnpm-lock.yaml --pnpm-store-version v11 -o /w/flatpak/node-sources.json'
```

> [!IMPORTANT]
> `--pnpm-store-version` must match the store version of the pnpm release
> pinned in the manifest (`pnpm store path` prints it, e.g. `.../store/v11`).
