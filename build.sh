#!/bin/bash

# Check if the environment variable ENABLE_IN_APP_PURCHASES is set
if [ ! -z "$ENABLE_IN_APP_PURCHASES" ]; then
    # Check if the file exists before performing actions
    if [ -f "src/features/tips/useInAppPurchase.implemented.ts" ]; then
        # Install cordova-plugin-purchase
        pnpm install cordova-plugin-purchase@13.8.2

        # Sync Capacitor with deployment
        npx cap sync --deployment

        # Remove and rename files
        rm src/features/tips/useInAppPurchase.ts
        mv src/features/tips/useInAppPurchase.implemented.ts src/features/tips/useInAppPurchase.ts

        echo "In-app purchases enabled."
    else
        echo "In-app purchases already enabled. Skipping installation and file operations."
    fi
else
    echo "In-app purchases not enabled."
fi

# Run Vite build regardless of the environment variable
vite build
