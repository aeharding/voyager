#!/bin/bash

# Use bun to read the version from package.json
version=$(bun -p "require('./package.json').version")

# Check if the git tag exists on the remote (origin) without 'v' prefix
if git ls-remote --tags origin "$version" | grep -q "refs/tags/$version"; then
    echo "Tag $version exists on origin (was released), proceeding with bump..."
    bunx release-it
    echo 'Version successfully bumped, but release not yet cut!'
else
    echo "Tag $version does not exist on origin."
    echo "This means $version hasn't been released yet."
fi

./scripts/release.sh