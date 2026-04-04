# OfflineGPT - Build Instructions

## Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- Expo account (free) at https://expo.dev

### Step 1: Install Dependencies
```bash
cd OfflineGPT
npm install
```

### Step 2: Install Expo CLI and EAS CLI
```bash
npm install -g expo-cli eas-cli
```

### Step 3: Login to Expo
```bash
eas login
```

### Step 4: Configure Project
```bash
eas build:configure
```

### Step 5: Build APK
```bash
# For preview/testing APK
eas build -p android --profile preview

# OR for production APK
eas build -p android --profile production
```

The build will be processed on Expo's cloud servers (free tier available).
Once complete, you'll get a download link for the APK!

---

## Local Build (Alternative)

If you want to build locally without Expo cloud:

### Prerequisites
- Android Studio with SDK
- Java JDK 17
- Android NDK

### Steps
```bash
# Generate native project
npx expo prebuild

# Build APK
cd android
./gradlew assembleRelease
```

APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

---

## Development Mode

To test the app during development:

```bash
# Start development server
npm start

# Scan QR code with Expo Go app on your phone
```

---

## Notes

- First build may take 10-15 minutes
- APK size will be ~30-50MB (excluding AI models)
- Models are downloaded separately after installation
- Works on Android 7.0+ (API 24+)
