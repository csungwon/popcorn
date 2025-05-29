# Popcorn - Local Development Setup (iOS)

This guide provides step-by-step instructions for setting up your macOS environment to run the `popcorn` Expo app locally. It specifically targets iOS development, accounting for the project's monorepo structure, use of `pnpm`, and native module requirements.

---

## Prerequisites: Essential Tools

Before you start, make sure you have these essential tools installed on your macOS system.

### 1. Xcode and Command Line Tools

You'll need Xcode to build iOS applications.

1.  Install Xcode from the Mac App Store:
    - Open the **App Store** application.
    - Search for "Xcode" and click **Get** or **Download**. This is a large download and might take a while.
2.  Open Xcode and Accept License:
    - Once downloaded, open `Xcode.app` from your Applications folder.
    - The first time it opens, Xcode will perform initial setup and ask you to accept its license agreement. Accept to proceed.
3.  Install Command Line Tools:
    - Open **Terminal** (Applications/Utilities/Terminal.app).
    - Run:
      ```bash
      xcode-select --install
      ```
    - A software update pop-up will appear. Click **Install** and agree to the terms.

4.  Install iOS components (Only if you plan to use simulator):
    - Go to `File` > `Settings` or press `cmd` + `,`
    - Click on **Components** tab.
    - Click **Get** button for iOS <version>

### 2. Node.js and pnpm

Expo requires Node.js and `pnpm` to manage project dependencies.

1.  Install Homebrew (if you don't have it):
    Homebrew is a package manager for macOS that simplifies installing development tools.
    - Open **Terminal**.
    - Run:
      ```bash
      /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
      ```
    - Follow the on-screen instructions.
2.  Install Node.js using Homebrew:
    - Open **Terminal**.
    - Run:
      ```bash
      brew install node
      ```
    - This installs Node.js and `npm` (Node Package Manager).
3.  Verify Node.js Installation:
    - Check versions:
      ```bash
      node -v
      npm -v
      ```
4.  Install pnpm:
    `pnpm` is a fast and efficient package manager crucial for this monorepo.
    - Open **Terminal**.
    - Run to install `pnpm` globally using `npm`:
      ```bash
      npm install -g pnpm
      ```
5.  Verify pnpm Installation:
    - Check version:
      ```bash
      pnpm -v
      ```

---

## Project Setup and Running the App

Follow these steps to clone the `popcorn` repository, configure it, and run the development build on an iOS simulator or physical device.

### 1. Clone the Repository

1.  Navigate to your desired development directory in **Terminal**:
    ```bash
    cd ~/Documents/Development/
    ```
2.  Clone the `popcorn` repository:
    ```bash
    git clone https://github.com/csungwon/popcorn.git
    ```
3.  Navigate into the main repository directory:
    ```bash
    cd popcorn
    ```

### 2. Install Project Dependencies

From the root of your `popcorn` project directory, install dependencies for all packages in the monorepo:

```bash
pnpm install
```

### 3. Navigate to the Expo App Package

The Expo app is located within the `packages/popcorn` directory. Navigate into this specific package:

```bash
cd packages/popcorn
```

### 4. Configure Environment Variables(`.env` file)

The app relies on specific environment variables for services like Google Sign-in and Google Maps. Without these, native modules will not function correctly.

- Create a file named `.env` in the `packages/popcorn` directory.
- Populate it with the following keys:

```plaintext
EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME=YOUR_GOOGLE_IOS_URL_SCHEME_HERE
EXPO_PUBLIC_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=YOUR_GOOGLE_IOS_CLIENT_ID_HERE
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID_HERE
```

- **Important**: Contact @csungwon for the actual values for these keys.

### 5. Build and Run the Development Client(iOS)

Since the app uses native modules such as Google Maps, you'll build a custom development client. This client will include your native modules, allowing you to test them on a simulator or your own device.

#### 1. Install CocoaPods

CocoaPods is a dependency manager for iOS projects, required for native modules.

```bash
sudo gem install cocoapods
```

#### 2. Run on iOS Simulator

From within the `packages/popcorn` directory, run:

```bash
pnpm exec expo run:ios
```

This command initiates the native iOS build process, installs the app on a simulator, and starts the Metro bundler. The initial build may take a considerable amount of time for installing, linking, compiling native modules.

#### 3. Run on a Physical iOS Device

To run your development build on a physical iOS device without a paid Apple Developer Account, you can use Xcode's free provisioning feature.

1. **Connect your iOS device**: Plug your iPhone into your Mac via USB.
2. **Trust the computer**: On your device, tap **Trust** and enter your passcode if prompted by "Trust This Computer?"
3. **Add your Apple ID to Xcode**:
   - Open **Xcode**
   - Go to `Xcode` > `Settings...` > `Accounts`
   - Click the `+` button, select `Apple ID`, and enter your credentials. This sets up a "Personal Team`
4. **Select your device in Xcode(Optional)**
   - This step should be followed after your build is complete(via `pnpm exec expo run:ios`)
   - **Open the Xcode project**: Navigate to `popcorn/packages/popcorn/ios` and open `Popcorn.xcworkspace`
   - In Xcode, go to `Product` > `Destination` and select your connected physical device.
5. Run on Physical Device:

   - From within the `packages/popcorn` directory in your Terminal, run:
     ```bash
     pnpm exec expo run:ios --device
     ```
   - Expo will prompt which device to use. Select your device and return. Then the process will build and install the development client. The process will eventually fail with the following error message:

     ```plaintext
     Error: xcrun devicectl device process launch --device 00008110-0018641C3EC2801E com.sungwon.corea.popcorn exited with non-zero code: 1

     ...

     The operation couldn’t be completed. Unable to launch com.sungwon.corea.popcorn because it has an invalid code signature, inadequate entitlements or its profile has not been explicitly trusted by the user. (FBSOpenApplicationErrorDomain error 3 (0x03))
     ```

   - **Trust the Developer on your device**: The first time, go to `Settings` > `General` > `VPN & Device Management` on your device. Under `Developer App`, tap your Apple ID email, then `Trust "[Your Apple ID Email]"`, and confirm
   - Run `pnpm exec expo run:ios --device` again to install and launch the app.

6. Start the Expo Development Server
   - This step is only required when the app has already been built(via `pnpm exec expo run:ios` or `pnpm exec expo run:ios --device`)
   - Use the following command to start the Metro bundler to server your JS code based on the ios app built previously:
     ```bash
     pnpm exec expo start
     ```
7. Connect to Development Build
   Your development client app should automatically connect ot the Metro bundler. If it doesn't, manually open the development client app on your simulator/device. You can scan the QR code displayed in your terminal.

You're all set! You've successfully configured your environment and run the `popcorn` Expo app locally.
