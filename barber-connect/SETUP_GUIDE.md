# Setup Guide - BarberConnect

Complete setup instructions for developers to get the BarberConnect app running locally.

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v9.0.0 or higher) - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **Expo CLI** - Install with `npm install -g expo-cli`

### Development Tools (Choose One)

#### For iOS Development (macOS only)
- **Xcode** (latest version) - [Download from App Store](https://apps.apple.com/app/xcode/id497799835)
- **iOS Simulator** (included with Xcode)

#### For Android Development
- **Android Studio** - [Download](https://developer.android.com/studio)
- **Android SDK** (API 33 or higher)
- **Android Emulator** or physical device

#### For Testing on Real Devices
- **Expo Go App** - Download from [iOS App Store](https://apps.apple.com/app/expo-go/id982107779) or [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Accounts Required
- **Firebase Account** - [Sign up](https://firebase.google.com/)
- **Expo Account** - [Sign up](https://expo.dev/)

---

## Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/barber-connect.git

# Navigate to project directory
cd barber-connect

# Install dependencies
npm install
```

---

## Step 2: Firebase Configuration

### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `barber-connect-dev`
4. Disable Google Analytics (optional for development)
5. Click **"Create project"**

### 2.2 Register Your App

#### For Web/Universal (Required)
1. In Firebase Console, click **"Add app"** > Select Web icon (`</>`)
2. Enter app nickname: `BarberConnect Web`
3. Check **"Also set up Firebase Hosting"** (optional)
4. Click **"Register app"**
5. Copy the Firebase configuration object

#### For iOS (Optional)
1. Click **"Add app"** > Select iOS icon
2. Enter iOS bundle ID: `com.yourcompany.barberconnect`
3. Download `GoogleService-Info.plist`
4. Follow platform-specific setup

#### For Android (Optional)
1. Click **"Add app"** > Select Android icon
2. Enter Android package name: `com.yourcompany.barberconnect`
3. Download `google-services.json`
4. Follow platform-specific setup

### 2.3 Enable Authentication

1. In Firebase Console, go to **Build** > **Authentication**
2. Click **"Get started"**
3. Enable the following sign-in methods:
   - **Email/Password** - Click "Enable" and save
   - **Google** (optional) - Follow setup wizard

### 2.4 Create Firestore Database

1. In Firebase Console, go to **Build** > **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select a location close to your users
5. Click **"Enable"**

**Production Security Rules** (update later):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Barber profiles are public for reading
    match /barbers/{barberId} {
      allow read: if true;
      allow write: if request.auth.uid == barberId;
    }

    // Posts are public for reading
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.authorId;
    }

    // Messages are private to participants
    match /messages/{messageId} {
      allow read, write: if request.auth != null &&
        (request.auth.uid == resource.data.senderId ||
         request.auth.uid == resource.data.receiverId);
    }

    // Bookings can be read by client or barber
    match /bookings/{bookingId} {
      allow read: if request.auth != null &&
        (request.auth.uid == resource.data.clientId ||
         request.auth.uid == resource.data.barberId);
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.clientId ||
                       request.auth.uid == resource.data.barberId;
    }
  }
}
```

### 2.5 Create Firebase Storage

1. In Firebase Console, go to **Build** > **Storage**
2. Click **"Get started"**
3. Choose **"Start in test mode"** (for development)
4. Click **"Next"** and **"Done"**

**Production Storage Rules** (update later):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User profile images
    match /users/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }

    // Barber portfolio images
    match /barbers/{barberId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.uid == barberId;
    }

    // Posts and messages
    match /posts/{postId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /messages/{conversationId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 2.6 Configure Firebase in Your App

Create a file: `src/services/firebase.ts`

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration from Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
```

**Important:** Never commit the actual API keys to version control. Use environment variables.

---

## Step 3: Environment Variables

### 3.1 Create Environment Files

Create `.env` file in project root:

```bash
# Firebase Configuration
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Expo Configuration
EXPO_PUBLIC_API_URL=http://localhost:3000

# Optional: Google Maps API Key (for map features)
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### 3.2 Update `.gitignore`

Ensure `.env` is in your `.gitignore`:

```
.env
.env.local
.env.development
.env.production
```

### 3.3 Create Example Environment File

Create `.env.example` for other developers:

```bash
# Copy this file to .env and fill in your values

# Firebase Configuration
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=

# Expo Configuration
EXPO_PUBLIC_API_URL=

# Google Maps API Key
GOOGLE_MAPS_API_KEY=
```

---

## Step 4: Install Dependencies

```bash
# Install all npm packages
npm install

# Or use yarn
yarn install
```

### Key Dependencies

The project uses these main packages:
- `expo` - Expo framework
- `react` - React library
- `react-native` - React Native framework
- `firebase` - Firebase SDK
- `@react-navigation/native` - Navigation
- `expo-image-picker` - Image selection
- `expo-location` - GPS location
- `expo-notifications` - Push notifications
- `@react-native-async-storage/async-storage` - Local storage

---

## Step 5: Run the Application

### Development Mode

Start the Expo development server:

```bash
npm start
# or
expo start
```

This will open the Expo Developer Tools in your browser.

### Run on iOS Simulator (macOS only)

```bash
# Option 1: From Expo DevTools
# Press 'i' in the terminal where `npm start` is running

# Option 2: Direct command
npm run ios
```

### Run on Android Emulator

```bash
# Make sure Android emulator is running
# Option 1: From Expo DevTools
# Press 'a' in the terminal

# Option 2: Direct command
npm run android
```

### Run on Physical Device

1. Install **Expo Go** app on your device
2. Make sure device is on the same WiFi network as your computer
3. Scan QR code shown in terminal/browser with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

### Run on Web

```bash
# Press 'w' in terminal or run
npm run web
```

---

## Step 6: Testing Push Notifications

Push notifications only work on physical devices, not simulators.

### 6.1 Setup Expo Notifications

1. Create an Expo account at [expo.dev](https://expo.dev)
2. Run `expo login` in terminal
3. Notifications will work automatically in development

### 6.2 Test Push Notifications

1. Run app on physical device
2. Sign in with a test account
3. Grant notification permissions when prompted
4. Test scenarios:
   - Send a message (should trigger notification)
   - Create a booking (should trigger notification)
   - Like/comment on post (should trigger notification)

### 6.3 Production Push Notifications

For production, you'll need to:
- Set up FCM (Firebase Cloud Messaging) credentials
- Configure APNs (Apple Push Notification service) for iOS
- Update `app.json` with proper configuration

---

## Step 7: Development Workflow

### Project Structure

```
barber-connect/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/             # Screen components
│   ├── navigation/          # Navigation setup
│   ├── services/            # Firebase services
│   ├── types/               # TypeScript types
│   ├── theme/               # Design tokens
│   └── utils/               # Utility functions
├── assets/                  # Images, fonts, icons
├── App.tsx                  # Root component
├── app.json                 # Expo configuration
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript config
```

### Hot Reload

Expo supports hot reloading. When you save a file, changes will automatically appear in the app.

### Clear Cache

If you encounter issues:

```bash
# Clear Expo cache
expo start -c

# Or
npm start -- --reset-cache
```

### TypeScript

The project uses TypeScript. Run type checking:

```bash
npx tsc --noEmit
```

---

## Common Issues and Solutions

### Issue 1: "Firebase not initialized"

**Solution:**
- Check `src/services/firebase.ts` has correct configuration
- Ensure Firebase project exists in console
- Verify API keys are correct

### Issue 2: "Metro bundler fails to start"

**Solution:**
```bash
# Kill existing metro processes
npx react-native start --reset-cache

# Or manually kill
lsof -ti:8081 | xargs kill
```

### Issue 3: "Module not found" errors

**Solution:**
```bash
# Clear node modules and reinstall
rm -rf node_modules
npm install

# Clear cache
expo start -c
```

### Issue 4: iOS build fails

**Solution:**
```bash
# Navigate to ios directory (if exists)
cd ios
pod install
cd ..

# Or reset CocoaPods
cd ios
rm -rf Pods
pod install
cd ..
```

### Issue 5: Android build fails

**Solution:**
```bash
# Clean Android build
cd android
./gradlew clean
cd ..

# Or clear gradle cache
rm -rf android/build
rm -rf android/app/build
```

### Issue 6: "Expo Go app crashes"

**Solution:**
- Ensure Expo Go app is up to date
- Check that app is on same WiFi as development machine
- Restart Expo Dev server
- Reinstall Expo Go app

### Issue 7: Images not uploading to Firebase Storage

**Solution:**
- Check Storage rules in Firebase Console
- Verify internet connection
- Check file size (Firebase has limits)
- Grant storage permissions in Firebase Console

### Issue 8: Push notifications not working

**Solution:**
- Notifications only work on physical devices
- Check notification permissions in device settings
- Verify push token is saved to Firestore
- Check Firebase Cloud Messaging setup

### Issue 9: Location services not working

**Solution:**
- Grant location permissions when prompted
- Enable GPS/Location Services on device
- Check if testing on simulator (some features limited)
- Use physical device for accurate testing

### Issue 10: Firestore permission denied

**Solution:**
- Check Firestore Security Rules
- Ensure user is authenticated
- Verify user ID matches document ownership
- Review rules in Firebase Console

---

## Testing the App

### Manual Testing Checklist

Test all major features:

#### Authentication
- [ ] Sign up with new account
- [ ] Sign in with existing account
- [ ] Password reset
- [ ] Sign out
- [ ] Profile creation for different roles

#### Booking
- [ ] View available time slots
- [ ] Create new booking
- [ ] View bookings list
- [ ] Cancel booking
- [ ] Reschedule booking

#### Messaging
- [ ] Start conversation
- [ ] Send text message
- [ ] Send image
- [ ] Real-time message updates
- [ ] Unread count

#### Social Features
- [ ] Create post with images
- [ ] Like/unlike post
- [ ] Comment on post
- [ ] Follow/unfollow user
- [ ] View feed

#### Barber Tools
- [ ] View analytics
- [ ] Manage services
- [ ] Update schedule
- [ ] Upload portfolio images

---

## Building for Production

### iOS Production Build

```bash
# Build iOS app
eas build --platform ios

# Or use Expo's classic build
expo build:ios
```

### Android Production Build

```bash
# Build Android APK
eas build --platform android

# Or use Expo's classic build
expo build:android
```

### Update Firebase Configuration

For production:
1. Create new Firebase project for production
2. Update environment variables
3. Enable production Firebase rules
4. Set up proper security measures

---

## Additional Resources

### Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [React Native](https://reactnative.dev/docs/getting-started)

### Community
- [Expo Discord](https://chat.expo.dev/)
- [React Native Community](https://github.com/react-native-community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/expo)

### Tools
- [Expo Snack](https://snack.expo.dev/) - Online playground
- [Reactotron](https://github.com/infinitered/reactotron) - Debugging tool
- [Flipper](https://fbflipper.com/) - Mobile debugging

---

## Getting Help

If you encounter issues:

1. Check this setup guide thoroughly
2. Review error messages carefully
3. Search existing issues on GitHub
4. Check Expo and Firebase documentation
5. Ask in project Discord/Slack channel
6. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Your environment (OS, Node version, etc.)
   - Screenshots if applicable

---

## Next Steps

After setup is complete:

1. Review the [API Reference](./API_REFERENCE.md) to understand available services
2. Check [Integration Complete](./INTEGRATION_COMPLETE.md) for feature overview
3. Read the main [README](./README.md) for project details
4. Start developing!

---

**Happy Coding!** 🚀

**Last Updated:** November 11, 2025
