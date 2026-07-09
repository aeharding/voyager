#!/usr/bin/env python3
"""Generate flatpak-builder sources for offline pnpm installs.

Parses pnpm-lock.yaml and emits a flatpak sources JSON that downloads
every registry tarball into flatpak-node/tarballs/. At build time,
`pnpm store add flatpak-node/tarballs/*.tgz` populates the store so
`pnpm install --offline` works without network access.

Usage:
    generate-pnpm-sources.py <pnpm-lock.yaml> -o node-sources.json
"""

import argparse
import base64
import json

import yaml

REGISTRY = "https://registry.npmjs.org"


def tarball_url(name: str, version: str) -> str:
    basename = name.split("/")[-1]
    return f"{REGISTRY}/{name}/-/{basename}-{version}.tgz"


def integrity_to_hex(integrity: str) -> tuple[str, str]:
    """Convert SRI (e.g. sha512-<base64>) to (algo, hex)."""
    algo, b64 = integrity.split("-", 1)
    return algo, base64.b64decode(b64).hex()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("lockfile")
    parser.add_argument("-o", "--output", required=True)
    args = parser.parse_args()

    with open(args.lockfile) as f:
        lock = yaml.safe_load(f)

    if not str(lock.get("lockfileVersion", "")).startswith("9"):
        raise SystemExit(
            f"Unsupported lockfile version {lock.get('lockfileVersion')!r} "
            "(expected 9.x) — update this script"
        )

    sources = []
    seen = set()

    for key, entry in (lock.get("packages") or {}).items():
        resolution = entry.get("resolution") or {}

        # name@version; scoped packages contain a leading @
        name, _, version = key.rpartition("@")

        url = resolution.get("tarball") or tarball_url(name, version)
        if url in seen:
            continue
        seen.add(url)

        integrity = resolution.get("integrity")
        if not integrity:
            raise SystemExit(f"No integrity for {key} — update this script")
        algo, hexdigest = integrity_to_hex(integrity)

        sources.append(
            {
                "type": "file",
                "url": url,
                algo: hexdigest,
                "dest": "flatpak-node/tarballs",
                "dest-filename": f"{name.replace('/', '_')}-{version}.tgz",
            }
        )

    sources.sort(key=lambda s: s["url"])

    with open(args.output, "w") as f:
        json.dump(sources, f, indent=2)
        f.write("\n")

    print(f"Wrote {len(sources)} sources to {args.output}")


if __name__ == "__main__":
    main()
