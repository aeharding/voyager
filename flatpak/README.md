# Flatpak packaging

Flathub builds are fully offline: `cargo-sources.json` and
`node-sources.json` pin every dependency from the lockfiles.

They are NOT committed here — CI regenerates them from the lockfiles on
every build, so they can't drift. Committed copies are only needed in the
flathub repo, generated at release time:

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
