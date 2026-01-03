# Hiruu - Job Marketplace App

A modern React Native mobile application built with Expo for connecting job seekers with employers.

## 🚀 Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Expo CLI** (will be installed during setup)
- **Git** - [Download](https://git-scm.com/)

### For iOS Development:

- **macOS** (required)
- **Xcode** (latest version from App Store)
- **CocoaPods** - Install via: `sudo gem install cocoapods`

### For Android Development:

- **Android Studio** - [Download](https://developer.android.com/studio)
- **Java Development Kit (JDK)** - Version 17 recommended

### For Testing on Physical Devices:

- **Expo Go** app on your iOS/Android device
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/xyryc/Hiruu-App.git
```

or Extract the zip file, then

```
cd Hiruu-App
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Install Expo CLI (if not already installed)

```bash
npm install -g expo-cli
# or
npx expo install
```

### 4. Verify Installation

```bash
npx expo --version
```

---

## 🏃 Running the Project

### Development Mode

#### Start the Development Server

```bash
npx expo start
# or
npm start
# or
yarn start
```

#### 📲 Run on Physical Device (Recommended for beginners)

1. Install **Expo Go** app on your phone
2. Start the development server (skip if it's running already):

```bash
npx expo start
# or
npm start
# or
yarn start
```

3. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

**Make sure your phone and computer are on the SAME WiFi network.**

## Run on Different Platforms

### 🤖 Run on Android Emulator/Physical Device through USB debugging

```bash
npx expo run:android
# or
npm run android
```

**Make sure Android Studio is installed and an emulator is running.**

**You can also run on physical device through USB debugging. In that case go to \***Developer Settings**\* in your phone and enable usb debugging. Now, connect your device through an usb cable and run the command again.**

### 📱 Run on iOS Simulator (macOS only)

```bash
npm run ios
# or
npx expo run:ios
```

**First time setup:**

```bash
# Install iOS dependencies
cd ios && pod install && cd ..
```

## 📱 How to Change Role (User/Business)

Find **_user.json_** in this directory: **_\root\assets\data\user.json_**

```bash
{
  "user": {
    "email": "abc@gmail.com",
    "token": "e4544fsefs46ty24f",
    "role": "user",
    "subRole": "manager",
    "permission": {
      "business_overview": true,
      "people_management": true,
      "job_management": true,
      "shift_and_schedule": true
}
```

Update the "role" field to "user" or "business" to navigate into different role. This project has been configured this way by keeping the API integration phase in mind, so it becomes easier to integrate quickly.

## 📱 How to build APK

#### Prerequisites

- Android Studio installed
- Java JDK 17 installed
- Android SDK configured

### 📲 Safe: Build Unsigned APK Locally (For Development/Testing)

#### Step 1: Prebuild Android Project

```bash
npx expo prebuild --platform android
```

This generates the `android/` folder.

#### Step 2: Build Debug APK

```bash
cd android
./gradlew assembleDebug
```

APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Step 3: Build Release APK (Unsigned)

```bash
cd android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

#### Step 4: Install on Device

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

or find the apk, copy and install it on your phone.

### 📲 Easy: Build APK using Github Workflow

#### Step 1: Check if your project is connected to your git repository

```bash
git remote -v
```

You should see an url with your github username.

#### Step 2: Create a new tag (increment the tag version eveytime, duplicate tags are not allowed)

```bash
git tag v1.x.x
```

#### Step 3: Push the created tag to trigger APK build using workflow

```bash
git push origin v1.x.x
```

#### Step 4: Find the APK

- Go to your repository's **_Actions_** tab.
- You should see your latest running workflow on top of the list.
- Click on it and wait for the build to complete.
- Once completed you should see **_Artifacts_** at the bottom of the screen.
- Download the file and extract the APK from the zip.

### ⚠️ Caution: Signed APK (For Production)

**_Please do not attempt if you dont understand this step._**

#### Generate Keystore

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-app-key.keystore -alias my-app-alias -keyalg RSA -keysize 2048 -validity 10000
```

#### Configure gradle.properties

Create/edit `android/gradle.properties`:

```properties
MYAPP_UPLOAD_STORE_FILE=my-app-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-app-alias
MYAPP_UPLOAD_STORE_PASSWORD=your_keystore_password
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
```

#### Update android/app/build.gradle

Add signing config:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}
```

#### Build Signed APK

```bash
cd android
./gradlew assembleRelease
```

Signed APK location: `android/app/build/outputs/apk/release/app-release.apk`

---

### Testing APK

#### Install on Connected Device

```bash
adb install path/to/your-app.apk
```

#### Check Device Connection

```bash
adb devices
```

#### View Logs

```bash
adb logcat | grep -i expo
```

## 🛠 Available Scripts

| Command                | Description                    |
| ---------------------- | ------------------------------ |
| `npx expo start`       | Run on Expo Go App (Easy)      |
| `npm run android`      | Run on Android emulator/device |
| `npx expo run:android` | Run on Android emulator/device |
| `npm start`            | Start Expo development server  |
| `npm run ios`          | Run on iOS simulator/device    |

---

## ⚙️ Environment Setup & App Configuration

### 1. Configure Environment Variables

Create a `.env` file in the root directory:

```env
API_URL=https://api.yourapp.com
EXPO_PUBLIC_API_KEY=your_api_key_here
```

### 2. Configure app.json

Update the following fields in `app.json`:

```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourapp"
    },
    "android": {
      "package": "com.yourcompany.yourapp"
    }
  }
}
```

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. **Metro bundler issues**

```bash
# Clear cache and restart
npx expo start -c
```

#### 2. **Module not found errors**

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 3. **iOS build fails**

```bash
# Reinstall pods
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

#### 4. **Android build fails**

```bash
# Clean Android build
cd android
./gradlew clean
cd ..
```

#### 5. **Font loading issues**

```bash
# Clear Expo cache
npx expo start -c
```

#### 6. **Network connection issues (Can't connect to development server)**

- Ensure phone and computer are on the same WiFi
- Try tunnel mode: `npx expo start --tunnel`
- Check firewall settings

#### 7. **Error: ENOSPC (Linux)**

```bash
# Increase file watchers
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnavigation.org/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [NativeWind Documentation](https://www.nativewind.dev/)

---

## 👥 Team

- **Md Talath Un Nabi** - _Lead Developer_ - [GitHub](https://github.com/xyryc)

---

## 📞 Support

For support, email mdtalathunnabi@gmail.com
