#!/bin/bash


# Check the folder doesn't exist before performing actions
if [ -d "src/features/tips/inAppPurchase__implemented" ]; then
    # Install cordova-plugin-purchase
    pnpm install --save-dev cordova-plugin-purchase@13.9.0

    # Adds the proprietary google play app purchase libs
    npx cap update

    # Remove and rename files
    rm -rf src/features/tips/inAppPurchase
    mv src/features/tips/inAppPurchase__implemented src/features/tips/inAppPurchase
else
    echo "In-app purchases already enabled. Skipping installation and file operations."
fi
