#!/bin/bash

# File path
implementedFile="src/features/tips/useInAppPurchase.implemented.ts"
setupScript="./enable_in_app_purchases.sh"

# Check if the environment variable ENABLE_IN_APP_PURCHASES is set
if [ ! -z "$ENABLE_IN_APP_PURCHASES" ]; then
    # Run the setup script
    bash "$setupScript"

    echo "In-app purchases enabled."
else
    echo "ENABLE_IN_APP_PURCHASES not set. In-app purchases not enabled."
fi

# Run Vite build regardless of the environment variable
npx vite build
