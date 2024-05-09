# Contributing to Voyager

Thanks for reading this guide! Voyager is an open source project, and community contributions have shaped Voyager everywhere from [its icon](https://github.com/aeharding/voyager/pull/519) to [custom swipe gestures](https://github.com/aeharding/voyager/pull/497).

## Found a bug?

First, check if your issue has already been reported by [searching](https://github.com/aeharding/voyager/issues) and checking recently reported issues. If it doesn't exist, create a new bug report [on Github](https://github.com/aeharding/voyager/issues/new/choose).

If you want to fix a bug, find the issue and make sure its not already assigned. Make sure to communicate your intentions on the issue.

Once you create a PR, make sure to link the original issue report, if it exists. For small fixes, it's OK to not link an issue.

## New feature?

New feature requests are welcome! First, check if your issue has already been requested by [searching](https://github.com/aeharding/voyager/issues). If it doesn't exist, please create one.

To increase the chance that your feature request will be accepted and worked on timely:

1.  Follow the issue template;
2.  Make sure that it is well scoped and actionable;
3.  Add user stories ("As a user...") to make it clear the benefit of the feature request

Ready to contribute code? Thank you! 💙 But before opening the code editor, please **check if the issue is already assigned**. An issue may already be assigned to another community member, or to myself (Alex). I often assign issues to myself because:

1.  More investigation is needed;
2.  I want Voyager to have a specific opinionated UX;
3.  The issue is complex; or
4.  Dependencies and/or conflicts with other work

If the issue is unassigned, **please confirm that it is OK to work on** in the issue by tagging [@aeharding](https://github.com/aeharding). The best way to ensure your new feature will be merged is to stay in communication.

## Development setup

### PWA/typical development

Most Voyager development is done in your preferred web browser like a normal webapp.

To get started, clone the repository and run on the root folder:

```sh
corepack enable
pnpm install
pnpm run dev
```

`Warning`: you will need `corepack` enabled.

### iOS Native App

If the feature you're working on is native-only, you can compile and run Voyager in an iOS Simulator or real device.

To build the iOS native app, install:

1. [Node](https://nodejs.org)
2. [Xcode](https://developer.apple.com/xcode/)
3. [Cocoapods](https://cocoapods.org)

Then, in Voyager's source code directory, build the project:

```sh
corepack enable
pnpm install
pnpm exec ionic capacitor build ios
```

Xcode should automatically open. You can then run the project with `CMD+R`.

### Android Native App

To build the Android native app, install:

1. [Node](https://nodejs.org)
2. [Android Studio](https://developer.android.com/studio)

Then, in Voyager's source code directory, build the project:

```sh
corepack enable
pnpm install
pnpm exec ionic capacitor build android
```

Android Studio should open.

You may need to sync. `File -> Sync Project with Gradle Files`

Finally, can run the project with `Ctrl+R`.

### Testing

Voyager uses [Vitest](https://vitest.dev). You can run the test suite with:

```
pnpm test
```

### 🚀 Releasing

To release a new version:

```sh
BUILD=123; npx release-it
```

Make sure the build number is incremental. This is used for F-droid.

Voyager uses [Ionic App Flow](https://ionic.io/appflow) for Apple App Store and Android Play Store builds. Those builds are initiated and monitored by Github Actions, where logs may be inspected.

**Voyager's Android and iOS builds are reproducible**! In fact, [F-droid independently builds Voyager](https://gitlab.com/fdroid/fdroiddata/-/blob/master/metadata/app.vger.voyager.yml) and verifies the same compiled APK is provided in Github Releases.

Note: F-droid and Github Releases binaries are built with `BUILD_FOSS_ONLY=true`. This removes all nonfree dependencies, currently just Google Play in-app purchases.
