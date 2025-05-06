#!/bin/bash
#
# Build ios app
#


start_time=$(date)

corepack enable
pnpm install
pnpm exec ionic capacitor build ios

end_time=$(date)

echo
echo "Start time:   ${start_time}"
echo "End time:     ${end_time}"
echo





