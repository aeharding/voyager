# Flatpak packaging

Packaging for [Flathub](https://flathub.org) (the default source for the
COSMIC Store, GNOME Software, etc.). Flathub builds are fully offline, so
all dependencies are pinned as flatpak sources:

- `cargo-sources.json` — generated from `src-tauri/Cargo.lock`
- `node-sources.json` — generated from `pnpm-lock.yaml` (every registry
  tarball; `pnpm store add` populates the store at build time so
  `pnpm install --offline` works, including `patchedDependencies`)

## Regenerating sources (on dependency changes)

```sh
docker run --rm -v "$PWD":/w python:3-slim sh -c '
  pip install -q aiohttp tomlkit pyyaml &&
  curl -s https://raw.githubusercontent.com/flatpak/flatpak-builder-tools/master/cargo/flatpak-cargo-generator.py -o /tmp/fcg.py &&
  python /tmp/fcg.py /w/src-tauri/Cargo.lock -o /w/flatpak/cargo-sources.json &&
  python /w/flatpak/generate-pnpm-sources.py /w/pnpm-lock.yaml -o /w/flatpak/node-sources.json'
```

## CI

`.github/workflows/flatpak.yml` builds the flatpak (x86_64) on PRs touching
this directory, and via manual dispatch. The manifest's `FLATPAK_GIT_COMMIT`
placeholder is substituted with the commit under test.

## Releasing

1. On version bump: update `releases` in `app.vger.voyager.metainfo.xml`,
   regenerate sources if the lockfiles changed.
2. Flathub submission/update: PR to the flathub repo with `commit:` pointing
   at the release tag's commit.

## TODO before Flathub submission

- Desktop screenshots for the metainfo (current ones are mobile placeholders)
- Verify AGPL-3.0-only vs -or-later
- flathub.json (arch allowlist) in the flathub repo
