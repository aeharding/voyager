#!/bin/bash
# Generates flatpak offline dependency sources from the lockfiles
# (flatpak/cargo-sources.json + flatpak/node-sources.json)
#
# Requires python3 + pip + git + curl. See README.md to run via docker.
set -euo pipefail

cd "${1:-"$(dirname "$0")/.."}"

FLATPAK_BUILDER_TOOLS_COMMIT=737c0085912f9f7dabf9341d4608e2a77a51a73a

# Must match the store version of the pnpm release pinned in
# app.vger.voyager.yml (`pnpm store path` prints it)
PNPM_STORE_VERSION=v11

# The flathub CI image preinstalls an outdated flatpak-node-generator in
# /app and exports PYTHONPATH=/app/lib/python3.13/site-packages, which
# shadows pip AND venv installs at import time (PYTHONPATH precedes venv
# site-packages) — verified: without this, the stale provider runs and
# emits broken pnpm config ("storeDir=" instead of "storeDir: ")
unset PYTHONPATH

VENV="$(mktemp -d)/venv"
python3 -m venv "$VENV"
"$VENV/bin/pip" install --quiet aiohttp tomlkit \
  "git+https://github.com/flatpak/flatpak-builder-tools.git@$FLATPAK_BUILDER_TOOLS_COMMIT#subdirectory=node"

curl -s "https://raw.githubusercontent.com/flatpak/flatpak-builder-tools/$FLATPAK_BUILDER_TOOLS_COMMIT/cargo/flatpak-cargo-generator.py" \
  -o /tmp/flatpak-cargo-generator.py
"$VENV/bin/python" /tmp/flatpak-cargo-generator.py src-tauri/Cargo.lock -o flatpak/cargo-sources.json

"$VENV/bin/flatpak-node-generator" pnpm pnpm-lock.yaml \
  --pnpm-store-version "$PNPM_STORE_VERSION" -o flatpak/node-sources.json

# pnpm itself, pinned by packageManager in package.json
# (its +sha512 suffix is the registry tarball's sha512)
python3 - << 'PY'
import json
import re

spec = json.load(open("package.json"))["packageManager"]
m = re.fullmatch(r"pnpm@([\w.-]+)\+sha512\.([0-9a-f]{128})", spec)
if not m:
    raise SystemExit(f"Cannot parse packageManager: {spec!r}")
version, sha512 = m.groups()

with open("flatpak/pnpm-sources.json", "w") as f:
    json.dump(
        [
            {
                "type": "archive",
                "url": f"https://registry.npmjs.org/pnpm/-/pnpm-{version}.tgz",
                "sha512": sha512,
                "dest": "pnpm-pkg",
                "strip-components": 1,
            }
        ],
        f,
        indent=2,
    )
    f.write("\n")
PY
