#!/bin/bash
#
# Build ios app
#

# export MARKETING_VERSION=1.0.0

corepack enable
pnpm install

pushd ios/App
pod install
popd

pnpm exec ionic capacitor build ios


#
# See:
# https://github.com/aeharding/voyager/blob/main/CONTRIBUTING.md
#

echo
echo
echo Xcode should automatically open. You can then run the project with CMD+R.
echo
echo

#
# No supported iOS devices are available. Connect a device to run your application or choose a simulated device as the destination.
#

#
# The application's Info.plist does not contain a valid CFBundleShortVersionString. Ensure your bundle contains a valid CFBundleShortVersionString
#
#





