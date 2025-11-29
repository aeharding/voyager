// swift-tools-version: 5.9
import PackageDescription

// DO NOT MODIFY THIS FILE - managed by Capacitor CLI commands
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "7.4.4"),
        .package(name: "CapacitorCommunityAppIcon", path: "../../../node_modules/.pnpm/@capacitor-community+app-icon@6.0.0_@capacitor+core@7.4.4/node_modules/@capacitor-community/app-icon"),
        .package(name: "CapacitorApp", path: "../../../node_modules/.pnpm/@capacitor+app@7.1.0_@capacitor+core@7.4.4/node_modules/@capacitor/app"),
        .package(name: "CapacitorFilesystem", path: "../../../node_modules/.pnpm/@capacitor+filesystem@7.1.5_@capacitor+core@7.4.4/node_modules/@capacitor/filesystem"),
        .package(name: "CapacitorHaptics", path: "../../../node_modules/.pnpm/@capacitor+haptics@7.0.2_patch_hash=181ec43efd13c6c40fd4856e855e5eb795ffff6f9f13bb23ed1_bbbd18c7e67d16a95aa1d5030f94c97a/node_modules/@capacitor/haptics"),
        .package(name: "CapacitorKeyboard", path: "../../../node_modules/.pnpm/@capacitor+keyboard@7.0.3_patch_hash=a9b910edbb5059e863b0b44c347168d2bf0b0a421868be03f7_5e183311d4412a7e5cb6542d2bc32333/node_modules/@capacitor/keyboard"),
        .package(name: "CapacitorNetwork", path: "../../../node_modules/.pnpm/@capacitor+network@7.0.2_@capacitor+core@7.4.4/node_modules/@capacitor/network"),
        .package(name: "CapacitorShare", path: "../../../node_modules/.pnpm/@capacitor+share@7.0.2_@capacitor+core@7.4.4/node_modules/@capacitor/share"),
        .package(name: "CapacitorSplashScreen", path: "../../../node_modules/.pnpm/@capacitor+splash-screen@7.0.3_@capacitor+core@7.4.4/node_modules/@capacitor/splash-screen"),
        .package(name: "CapacitorStatusBar", path: "../../../node_modules/.pnpm/@capacitor+status-bar@7.0.3_@capacitor+core@7.4.4/node_modules/@capacitor/status-bar"),
        .package(name: "CapacitorAndroidNavMode", path: "../../../node_modules/.pnpm/capacitor-android-nav-mode@2.0.0_@capacitor+core@7.4.4/node_modules/capacitor-android-nav-mode"),
        .package(name: "CapacitorApplicationContext", path: "../../../node_modules/.pnpm/capacitor-application-context@2.0.0_@capacitor+core@7.4.4/node_modules/capacitor-application-context"),
        .package(name: "CapacitorBiometricLock", path: "../../../node_modules/.pnpm/capacitor-biometric-lock@2.0.0_@capacitor+core@7.4.4/node_modules/capacitor-biometric-lock"),
        .package(name: "CapacitorClearCache", path: "../../../node_modules/.pnpm/capacitor-clear-cache@2.0.0_@capacitor+core@7.4.4/node_modules/capacitor-clear-cache"),
        .package(name: "CapacitorLaunchNative", path: "../../../node_modules/.pnpm/capacitor-launch-native@2.0.0_@capacitor+core@7.4.4/node_modules/capacitor-launch-native"),
        .package(name: "CapacitorPluginSafeArea", path: "../../../node_modules/.pnpm/capacitor-plugin-safe-area@4.0.3_@capacitor+core@7.4.4/node_modules/capacitor-plugin-safe-area"),
        .package(name: "CapacitorReader", path: "../../../node_modules/.pnpm/capacitor-reader@1.0.0_@capacitor+core@7.4.4/node_modules/capacitor-reader"),
        .package(name: "CapacitorShareSafari", path: "../../../node_modules/.pnpm/capacitor-share-safari@0.1.2_@capacitor+core@7.4.4/node_modules/capacitor-share-safari"),
        .package(name: "CapacitorStashMedia", path: "../../../node_modules/.pnpm/capacitor-stash-media@3.1.1_@capacitor+core@7.4.4/node_modules/capacitor-stash-media"),
        .package(name: "CapacitorTips", path: "../../../node_modules/.pnpm/capacitor-tips@2.2.0_@capacitor+core@7.4.4/node_modules/capacitor-tips")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CapacitorCommunityAppIcon", package: "CapacitorCommunityAppIcon"),
                .product(name: "CapacitorApp", package: "CapacitorApp"),
                .product(name: "CapacitorFilesystem", package: "CapacitorFilesystem"),
                .product(name: "CapacitorHaptics", package: "CapacitorHaptics"),
                .product(name: "CapacitorKeyboard", package: "CapacitorKeyboard"),
                .product(name: "CapacitorNetwork", package: "CapacitorNetwork"),
                .product(name: "CapacitorShare", package: "CapacitorShare"),
                .product(name: "CapacitorSplashScreen", package: "CapacitorSplashScreen"),
                .product(name: "CapacitorStatusBar", package: "CapacitorStatusBar"),
                .product(name: "CapacitorAndroidNavMode", package: "CapacitorAndroidNavMode"),
                .product(name: "CapacitorApplicationContext", package: "CapacitorApplicationContext"),
                .product(name: "CapacitorBiometricLock", package: "CapacitorBiometricLock"),
                .product(name: "CapacitorClearCache", package: "CapacitorClearCache"),
                .product(name: "CapacitorLaunchNative", package: "CapacitorLaunchNative"),
                .product(name: "CapacitorPluginSafeArea", package: "CapacitorPluginSafeArea"),
                .product(name: "CapacitorReader", package: "CapacitorReader"),
                .product(name: "CapacitorShareSafari", package: "CapacitorShareSafari"),
                .product(name: "CapacitorStashMedia", package: "CapacitorStashMedia"),
                .product(name: "CapacitorTips", package: "CapacitorTips")
            ]
        )
    ]
)
