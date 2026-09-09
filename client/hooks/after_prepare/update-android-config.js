#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const configFile = path.join(__dirname, '..', '..', 'platforms', 'android', 'cdv-gradle-config.json');

// Only patch if file exists
if (fs.existsSync(configFile)) {
  const customConfig = {
    MIN_SDK_VERSION: 23,
    SDK_VERSION: 34,
    COMPILE_SDK_VERSION: 34,
    GRADLE_VERSION: "8.0.2",
    MIN_BUILD_TOOLS_VERSION: "33.0.2",
    AGP_VERSION: "8.0.2",
    KOTLIN_VERSION: "1.8.22",
    ANDROIDX_APP_COMPAT_VERSION: "1.6.1",
    ANDROIDX_WEBKIT_VERSION: "1.7.0",
    ANDROIDX_CORE_SPLASHSCREEN_VERSION: "1.0.1",
    GRADLE_PLUGIN_GOOGLE_SERVICES_VERSION: "4.3.15",
    IS_GRADLE_PLUGIN_GOOGLE_SERVICES_ENABLED: true,
    IS_GRADLE_PLUGIN_KOTLIN_ENABLED: true,
    PACKAGE_NAMESPACE: "com.vensi.harscopk",
    JAVA_SOURCE_COMPATIBILITY: "11",
    JAVA_TARGET_COMPATIBILITY: "11"
  };

  fs.writeFileSync(configFile, JSON.stringify(customConfig, null, 2));
  console.log('✅ cdv-gradle-config.json has been patched successfully.');
} else {
  console.warn('⚠️ cdv-gradle-config.json not found yet.');
}
