# Running Luna's Pet Central

## Prerequisites

- **Node.js** 18+ (recommended: use `nvm` or `fnm`)
- **npm** 9+ (comes with Node.js)
- **Expo CLI** (installed automatically via `npm install`)
- **Mobile device** with Expo Go app installed, OR an emulator/simulator

### iOS Simulator (Mac only)
```bash
# Install Xcode command line tools if not already installed
xcode-select --install

# Install CocoaPods (required for iOS builds)
sudo gem install cocoapods
```

### Android Emulator
- Install [Android Studio](https://developer.android.com/studio) and create an emulator, OR
- Use the Expo Go app on a physical Android device

---

## Quick Start

### 1. Install Dependencies

```bash
cd Pet-Shelter-MVP
npm install
```

This installs all dependencies including:
- `expo` — React Native framework
- `react-native` — Core RN library
- `drizzle-orm` — Type-safe SQL query builder
- `better-sqlite3` — Local SQLite database (for testing)
- `zod` — Runtime validation
- `zustand` — State management

### 2. Start the Development Server

```bash
npm start
```

This launches the Expo development server. You should see output similar to:

```
Starting Metro Bundler
Scanner QR code with Expo Go app on your device
```

### 3. Run on Device or Emulator

**Option A: Physical Device (Recommended)**
1. Install [Expo Go](https://expo.dev/go) on your iOS or Android device
2. Scan the QR code displayed in the terminal
3. The app will load automatically

**Option B: iOS Simulator (Mac)**
```bash
npm run ios
```

**Option C: Android Emulator**
```bash
npm run android
```

**Option D: Web Browser**
```bash
npm run web
```

---

## Development Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo development server |
| `npm run android` | Run on Android device/emulator |
| `npm run ios` | Run on iOS simulator (Mac only) |
| `npm run web` | Run in web browser |
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run typecheck` | Type-check TypeScript without emitting |

---

## Project Structure

```
Pet-Shelter-MVP/
├── src/                      # Application source code
│   ├── core/                 # Business logic layer
│   │   ├── usecases/         # Use case implementations
│   │   ├── contracts/        # Repository and service interfaces
│   │   ├── schemas/          # Zod validation schemas
│   │   ├── domain/           # Domain models and enums
│   │   └── state/            # Zustand stores
│   ├── adapters/             # Infrastructure adapters
│   │   ├── sqlite/           # SQLite persistence layer
│   │   ├── export/           # Data export service
│   │   └── fs/               # File system adapter
│   └── utils/                # Utility functions
├── tests/                    # Test files (Vitest)
├── docs/                     # Documentation
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── app.json                  # Expo configuration
└── vitest.config.ts          # Test configuration
```

---

## Configuration

### Environment Variables

Create a `.env` file in the project root for environment-specific configuration:

```bash
# .env
EXPO_PUBLIC_APP_NAME="Luna's Pet Central"
EXPO_PUBLIC_VERSION="1.0.0"
```

### Expo Configuration

Edit `app.json` to customize:
- App name and slug
- Bundle identifier (`org.lunaspetcentral.app`)
- Splash screen and icon assets
- Platform-specific settings (iOS/Android)

---

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run a Specific Test File

```bash
npx vitest run tests/pet-lifecycle.test.ts
```

### Run Tests Matching a Pattern

```bash
npx vitest run --reporter=verbose tests/*-test.ts
```

---

## Troubleshooting

### Metro Bundler Won't Start

```bash
# Clear Metro cache
npx expo start --clear

# Or kill existing Metro processes
pkill -f "metro"
npm start
```

### TypeScript Errors

```bash
# Check for type errors
npm run typecheck

# Fix common issues
npm install
```

### iOS Build Issues (Mac)

```bash
# Reset CocoaPods cache
cd ios && pod deintegrate && pod install && cd ..

# Clear derived data
rm -rf ~/Library/Developer/Xcode/DerivedData
```

### Android Emulator Not Starting

- Ensure Android Studio is installed and an emulator is running
- Check that `ANDROID_HOME` is set in your environment:
  ```bash
  export ANDROID_HOME=$HOME/Library/Android/sdk
  export PATH=$PATH:$ANDROID_HOME/emulator
  export PATH=$PATH:$ANDROID_HOME/platform-tools
  ```

### SQLite Issues on Web

The app uses `better-sqlite3` which is Node.js-only. For web builds:
- Use the Expo Go app on a physical device, OR
- Configure a WASM-based SQLite adapter for web (future enhancement)

---

## Building for Production

### iOS App Store Build

```bash
# Prebuild native projects
npx expo prebuild --platform ios

# Open Xcode and build
open ios/LunasPetCentral.xcworkspace
```

### Android Play Store Build

```bash
# Prebuild native projects
npx expo prebuild --platform android

# Open Android Studio and build
open android
```

### EAS Build (Cloud Builds)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

---

## Development Workflow

1. **Start the server:** `npm start`
2. **Open on device:** Scan QR code with Expo Go
3. **Make changes:** Edit files in `src/` — Metro hot-reloads automatically
4. **Run tests:** `npm test` to verify changes
5. **Type-check:** `npm run typecheck` before committing

---

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Zod Documentation](https://zod.dev/)
- [Zustand Documentation](https://zustand.docs.pmnd.rs/)
