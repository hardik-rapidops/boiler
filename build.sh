#!/bin/bash

# Universal build script for Cordova project (client + server)
# Compatible with Bitbucket CI and local macOS (including M1)

set -e
set -x

# Get current dir
platform_dir=$(cd "$(dirname "$0")" && pwd)
cd "$platform_dir"

# Clean root dependencies
rm -rf node_modules
npm install -g cordova@12.0.0 bower gulp
npm install

# Ensure CocoaPods is installed (needed for cordova-plugin-firebasex)
if ! command -v pod >/dev/null 2>&1; then
    echo "⚠️ CocoaPods not found, installing..."
    if command -v brew >/dev/null 2>&1; then
        brew install cocoapods
    else
        sudo gem install cocoapods -v '>=1.11.2' || gem install cocoapods -v '>=1.11.2'
    fi
else
    echo "✅ CocoaPods already installed: $(pod --version)"
fi

# Always update pod repo to avoid Firebase pod resolution issues
pod repo update

# Build client
pushd client

    # Remove Cordova platforms *safely* first (before wiping folders)
    cordova platform rm android || true
    cordova platform rm ios || true
    cordova platform rm browser || true

    # Now it's safe to remove these folders manually
    rm -rf node_modules bower_components platforms plugins www
    mkdir -p www

    npm install
    bower install --allow-root

    # Add Cordova platforms
    cordova platform add android@12.0.1
    cordova platform add browser
    cordova platform add ios@5.0.0   # 👈 iOS pinned to 5.0.0

    # --- PATCH 1: Replace build.gradle in plugin ---
    # PLUGIN_GRADLE="plugins/cordova-support-google-services/build.gradle"
    # if [ -f "$PLUGIN_GRADLE" ]; then
    #     sed -i '' \
    #     's#classpath .com.android.tools.build:gradle:3.+.#classpath '"'"'com.android.tools.build:gradle:8.0.2'"'"'#' \
    #     "$PLUGIN_GRADLE"
    #     sed -i '' \
    #     's#classpath .com.google.gms:google-services:4.3.3.#classpath '"'"'com.google.gms:google-services:4.3.15'"'"'#' \
    #     "$PLUGIN_GRADLE"
    # fi

    gulp clean
    gulp build --max_old_space_size=2000

    # Prepare all platforms (this generates client/www, cordova-js-src, etc.)
    cordova prepare browser
    cordova prepare android
    cordova prepare ios

    # Run pod install inside iOS platform after prepare
    if [ -d "platforms/ios" ]; then
        pushd platforms/ios
        pod install --repo-update
        popd
    fi

    cordova build browser

    # --- PATCH 2: Update app/build.gradle ---
    # APP_GRADLE="platforms/android/app/build.gradle"
    # if [ -f "$APP_GRADLE" ]; then
    #     sed -i '' \
    #     's#apply plugin: .com.google.gms.google-services.#if (cordovaConfig.IS_GRADLE_PLUGIN_GOOGLE_SERVICES_ENABLED \&\& project.extensions.findByName("googleServices") == null) {\n    apply plugin: '"'"'com.google.gms.google-services'"'"'\n}#' \
    #     "$APP_GRADLE"
    # fi

popd

# Build background tasks
pushd bgtasks
    rm -rf node_modules
    npm install
popd

# Prune dev dependencies
npm prune --production

# Local macOS workaround for GNU tar with --transform (optional: brew install gnu-tar)
# Replace `tar` with `gtar` if you use GNU tar locally
TAR_BIN=tar
if [[ $(uname) == "Darwin" && $(which gtar) ]]; then
    TAR_BIN=gtar
fi

# Build tarball
rm -f harsco.tar.gz

$TAR_BIN -zcf harsco.tar.gz \
    --transform 's#client/platforms/browser/www#client/www#' \
    --transform 's#client/platforms/android/app/src/main/assets/www#client/www/android#' \
    --transform 's#client/platforms/ios/www#client/www/ios#' \
    client/platforms/browser/www \
    client/platforms/android/app/src/main/assets/www/ \
    client/platforms/ios/www \
    setup_instance.sh run_pacman.sh cf-templates node_modules common server definitions setup bgtasks

# Export build timestamp (CI compatible)
BUILD_TIME=$(date)
echo "BUILD_TIME=$(echo "$BUILD_TIME")" >> $GITHUB_ENV || true

echo "✅ Build completed at $BUILD_TIME"
