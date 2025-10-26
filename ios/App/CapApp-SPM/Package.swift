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
        .package(name: "CapacitorCommunityAppIcon", path: "../../../node_modules/.bun/@capacitor-community+app-icon@6.0.0+1d43a6a1837411c8/node_modules/@capacitor-community/app-icon"),
        .package(name: "CapacitorApp", path: "../../../node_modules/.bun/@capacitor+app@7.1.0+1d43a6a1837411c8/node_modules/@capacitor/app"),
        .package(name: "CapacitorFilesystem", path: "../../../node_modules/.bun/@capacitor+filesystem@7.1.4+1d43a6a1837411c8/node_modules/@capacitor/filesystem"),
        .package(name: "CapacitorHaptics", path: "../../../node_modules/.bun/@capacitor+haptics@7.0.2+1d43a6a1837411c8/node_modules/@capacitor/haptics"),
        .package(name: "CapacitorKeyboard", path: "../../../node_modules/.bun/@capacitor+keyboard@7.0.3+1d43a6a1837411c8/node_modules/@capacitor/keyboard"),
        .package(name: "CapacitorNetwork", path: "../../../node_modules/.bun/@capacitor+network@7.0.2+1d43a6a1837411c8/node_modules/@capacitor/network"),
        .package(name: "CapacitorShare", path: "../../../node_modules/.bun/@capacitor+share@7.0.2+1d43a6a1837411c8/node_modules/@capacitor/share"),
        .package(name: "CapacitorSplashScreen", path: "../../../node_modules/.bun/@capacitor+splash-screen@7.0.3+1d43a6a1837411c8/node_modules/@capacitor/splash-screen"),
        .package(name: "CapacitorStatusBar", path: "../../../node_modules/.bun/@capacitor+status-bar@7.0.3+1d43a6a1837411c8/node_modules/@capacitor/status-bar"),
        .package(name: "CapacitorAndroidNavMode", path: "../../../node_modules/.bun/capacitor-android-nav-mode@2.0.0+1d43a6a1837411c8/node_modules/capacitor-android-nav-mode"),
        .package(name: "CapacitorApplicationContext", path: "../../../node_modules/.bun/capacitor-application-context@2.0.0+1d43a6a1837411c8/node_modules/capacitor-application-context"),
        .package(name: "CapacitorBiometricLock", path: "../../../node_modules/.bun/capacitor-biometric-lock@2.0.0+1d43a6a1837411c8/node_modules/capacitor-biometric-lock"),
        .package(name: "CapacitorClearCache", path: "../../../node_modules/.bun/capacitor-clear-cache@2.0.0+1d43a6a1837411c8/node_modules/capacitor-clear-cache"),
        .package(name: "CapacitorLaunchNative", path: "../../../node_modules/.bun/capacitor-launch-native@2.0.0+1d43a6a1837411c8/node_modules/capacitor-launch-native"),
        .package(name: "CapacitorPluginSafeArea", path: "../../../node_modules/.bun/capacitor-plugin-safe-area@4.0.2+1d43a6a1837411c8/node_modules/capacitor-plugin-safe-area"),
        .package(name: "CapacitorReader", path: "../../../node_modules/.bun/capacitor-reader@1.0.0+1d43a6a1837411c8/node_modules/capacitor-reader"),
        .package(name: "CapacitorShareSafari", path: "../../../node_modules/.bun/capacitor-share-safari@0.1.2+1d43a6a1837411c8/node_modules/capacitor-share-safari"),
        .package(name: "CapacitorStashMedia", path: "../../../node_modules/.bun/capacitor-stash-media@3.1.1+1d43a6a1837411c8/node_modules/capacitor-stash-media"),
        .package(name: "CapacitorTips", path: "../../../node_modules/.bun/capacitor-tips@2.2.0+1d43a6a1837411c8/node_modules/capacitor-tips")
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
