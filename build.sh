#!/bin/bash

setupScript="./disable_in_app_purchases.sh"

# Check if the environment variable BUILD_FOSS_ONLY is set
if [ ! -z "$BUILD_FOSS_ONLY" ]; then
    # Run the setup script
    bash "$setupScript"

    echo "In-app purchases disabled."
else
    echo "BUILD_FOSS_ONLY not set. In-app purchases not disabled."
fi

# Run Vite build regardless of the environment variable
npx vite build
