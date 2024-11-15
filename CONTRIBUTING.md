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

Voyager uses Github Actions for Apple App Store and Android Play Store builds, where logs may be inspected.

**Voyager's Android and iOS builds are reproducible**! In fact, [F-droid independently builds Voyager](https://gitlab.com/fdroid/fdroiddata/-/blob/master/metadata/app.vger.voyager.yml) and verifies the same compiled APK is provided in Github Releases.

Note: F-droid and Github Releases binaries are built with `BUILD_FOSS_ONLY=true`. This removes all nonfree dependencies, currently just Google Play in-app purchases.

> [!IMPORTANT]
> Release tags are detached from main so that CI can commit build metadata for fdroid.
>
> You can visualize where release tags have diverged from main like this:
>
> ```sh
> git log --graph --oneline --tags
> ```
>
> To see all commits between a release tag and main, you can use the following (replace `MY_RELEASE_TAG`):
>
> ```sh
> git log main..MY_RELEASE_TAG
> ```
>
> To determine the exact commit where a release tag diverged from main, you can use the following (replace `MY_RELEASE_TAG`):
>
> ```sh
> git rev-parse $(git rev-list --exclude-first-parent-only ^main MY_RELEASE_TAG| tail -1)^
> ```

#### Start the release process

1. Make sure the version is incremented. Increment in `package.json` and push (if necessary)
2. Trigger the `release` workflow in Github Actions from the relevant commit

> [!TIP]
> Shorthand: `pnpm release` (relies on [`gh`](https://cli.github.com))

#### The `release` workflow will:

1. Set the build number to the current Github run number (and detect the version from `package.json`)
2. Upload `release-data` artifact with trapeze changes and `.env` file

Then, it will fork depending on the `release_behavior` (e.g. building on main or publishing a release):

##### Building on main

1. Dispatch the `build_release` workflow with `is_main_build=true`

##### Publishing a release

2. Commit the `release-data`
3. Tag the release (e.g. `1.0.0`)
4. As a side-effect of tagging, trigger the `build_release` workflow

#### The `build_release` workflow will:

1. Build web app — `Voyager-Web-<version>.zip`
2. Build non-FOSS Google Play Android — **no artifact**
3. Build iOS artifact — `Voyager-iOS-<version>.ipa`
4. Build FOSS-only Android — `Voyager-Android-<version>.apk`
5. Upload to the Apple App Store and Google Play Store
6. Deploy PWA to [beta.vger.app](https://beta.vger.app) (testing track) or [vger.app](https://vger.app) (release track)
7. Create a Github Release with the artifacts

#### several_days_later_spongebob_meme.jpg

In a few days, F-droid will scan the repo for new tags and [independently build](https://gitlab.com/fdroid/fdroiddata/-/blob/master/metadata/app.vger.voyager.yml) the FOSS-only Android native app. It will verify reproducibility against Github Releases, and then publish the app.

This is the main reason why each release tags trapeze changes (and build metadata) as a new commit. It also makes it easier for anyone to verify reproducibility.
