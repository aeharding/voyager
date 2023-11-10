#!/bin/bash

setupScript="./disable_in_app_purchases.sh"

# Check if the environment variable DISABLE_IN_APP_PURCHASES is set
if [ ! -z "$DISABLE_IN_APP_PURCHASES" ]; then
    # Run the setup script
    bash "$setupScript"

    echo "In-app purchases disabled."
else
    echo "DISABLE_IN_APP_PURCHASES not set. In-app purchases not disabled."
fi

# Run Vite build regardless of the environment variable
npx vite build
