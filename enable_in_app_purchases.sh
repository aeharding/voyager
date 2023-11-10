#!/bin/bash

# File path
implementedFile="src/features/tips/useInAppPurchase.implemented.ts"

# Check the file doesn't exist before performing actions
if [ -f "$implementedFile" ]; then
    # Install cordova-plugin-purchase
    pnpm install --save-dev cordova-plugin-purchase@13.9.0

    # Adds the proprietary google play app purchase libs
    npx cap update

    # Remove and rename files
    rm src/features/tips/useInAppPurchase.ts
    mv "$implementedFile" src/features/tips/useInAppPurchase.ts
else
    echo "In-app purchases already enabled. Skipping installation and file operations."
fi
