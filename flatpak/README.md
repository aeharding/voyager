# Flatpak packaging

Packaging for [Flathub](https://flathub.org) (the default source for the
COSMIC Store, GNOME Software, etc.). Flathub builds are fully offline, so
all dependencies are pinned as flatpak sources:

- `cargo-sources.json` — generated from `src-tauri/Cargo.lock`
- `node-sources.json` — generated from `pnpm-lock.yaml` by upstream
  [flatpak-node-generator](https://github.com/flatpak/flatpak-builder-tools/tree/master/node)
  (pnpm provider). It bundles a store-population script so
  `pnpm install --offline` works, including `patchedDependencies`.

## Regenerating sources (on dependency changes)

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

## CI

`.github/workflows/flatpak.yml` builds the flatpak (x86_64) on PRs touching
this directory, and via manual dispatch. The manifest's `FLATPAK_GIT_COMMIT`
placeholder is substituted with the commit under test.

## Releasing

Flathub does not watch for release tags (unlike F-Droid). Each Voyager
release needs a small PR to the flathub repo
(once it exists, post-submission):

1. Add the release to `releases` in `app.vger.voyager.metainfo.xml` (here).
2. In the flathub repo: point the manifest `commit:` at the release tag's
   commit, and copy over regenerated sources JSONs if the lockfiles changed
   since the last release (usually the case).

## Initial Flathub submission

PR against the `new-pr` branch of
[flathub/flathub](https://github.com/flathub/flathub) containing the
manifest (with a real `commit:`), the sources JSONs, and a `flathub.json`.
