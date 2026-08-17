#!/bin/bash
# Injects the current release (with changelog from feat/fix commit subjects
# since the previous tag) into the flatpak metainfo, which intentionally has
# no <releases> in main. Run by release.yml when creating the release commit.
# Usage: generate_metainfo_release.sh <version>
set -euo pipefail

cd "$(dirname "$0")/.."

VERSION="$1"
DATE=$(date +%F)
METAINFO=flatpak/app.vger.voyager.metainfo.xml

if grep -q '<releases>' "$METAINFO"; then
  echo "Error: $METAINFO already contains <releases>" >&2
  exit 1
fi

PREV_TAG=$(git tag --sort=-creatordate | grep -E '^[0-9]+\.[0-9]+\.[0-9]+$' | head -1 || true)
if [ -z "$PREV_TAG" ]; then
  echo "Error: no previous release tag found (shallow clone?)" >&2
  exit 1
fi

NOTES=$(git log --format=%s "$PREV_TAG"..HEAD |
  grep -E '^(feat|fix)(\([^)]*\))?!?: ' |
  sed -E 's/^(feat|fix)(\([^)]*\))?!?: //; s/ \(#[0-9]+\)$//; s/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g; s/^./\U&/' || true)

if [ -n "$NOTES" ]; then
  ITEMS=$(while IFS= read -r line; do printf '          <li>%s</li>\n' "$line"; done <<< "$NOTES")
  ENTRY="    <release version=\"$VERSION\" date=\"$DATE\">
      <description>
        <ul>
${ITEMS%$'\n'}
        </ul>
      </description>
    </release>"
else
  ENTRY="    <release version=\"$VERSION\" date=\"$DATE\" />"
fi

BLOCK="  <releases>
$ENTRY
  </releases>
"

# ENVIRON, not -v: -v reprocesses backslash escapes in the value
BLOCK="$BLOCK" awk '/^<\/component>$/ { printf "%s", ENVIRON["BLOCK"] } { print }' "$METAINFO" > "$METAINFO.tmp"
mv "$METAINFO.tmp" "$METAINFO"

if ! grep -q '<releases>' "$METAINFO"; then
  echo "Error: failed to inject <releases> into $METAINFO" >&2
  exit 1
fi
python3 -c 'import sys, xml.dom.minidom; xml.dom.minidom.parse(sys.argv[1])' "$METAINFO"
