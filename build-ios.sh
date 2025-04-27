#!/bin/bash
#
# Build ios app
#

corepack enable
pnpm install
pnpm exec ionic capacitor build ios






