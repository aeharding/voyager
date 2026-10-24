"""Inventory external Dockerfile images, retaining exact tags and digest pins."""

import json
from pathlib import Path
import re

images = [{"name": "published-runtime", "image": "ghcr.io/aeharding/voyager:latest"}]
stages = set()
seen = set()
for line in Path("Dockerfile").read_text().splitlines():
    if not re.match(r"^\s*FROM\b", line, re.IGNORECASE):
        continue
    match = re.fullmatch(
        r"\s*FROM\s+(?:--platform=\S+\s+)?(\S+)(?:\s+AS\s+(\S+))?\s*(?:#.*)?",
        line,
        re.IGNORECASE,
    )
    if not match:
        raise ValueError(f"Cannot resolve Dockerfile image: {line}")
    image, stage = match.groups()
    if image.lower() not in stages and image.lower() != "scratch":
        if "$" in image:
            raise ValueError(f"Resolve build arguments before auditing image: {image}")
        if image not in seen:
            seen.add(image)
            images.append({"name": f"docker-base-{len(seen)}", "image": image})
    if stage:
        stages.add(stage.lower())
if not seen:
    raise ValueError("No external Dockerfile images found")
print("matrix=" + json.dumps({"include": images}))
