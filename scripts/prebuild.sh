#!/bin/sh

SETUP_SCRIPT="./scripts/disable_in_app_purchases.sh"

# Check if the environment variable BUILD_FOSS_ONLY is set
if [ ! -z "$BUILD_FOSS_ONLY" ]; then
    # Run the setup script
    sh "$SETUP_SCRIPT"

    echo "In-app purchases disabled."
else
    echo "BUILD_FOSS_ONLY not set. In-app purchases not disabled."
fi
