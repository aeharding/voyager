#!/bin/bash


# Check the folder doesn't exist before performing actions
if [ -d "src/features/tips/inAppPurchase__stub" ]; then
    # Install cordova-plugin-purchase
    pnpm uninstall cordova-plugin-purchase

    # Removes the proprietary google play app purchase libs
    npx cap update

    # Remove and rename files
    rm -rf src/features/tips/inAppPurchase
    mv src/features/tips/inAppPurchase__stub src/features/tips/inAppPurchase
else
    echo "In-app purchases already disabled and references removed. Skipping uninstallation and file operations."
fi
