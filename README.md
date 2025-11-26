# GUARD.IO

GUARD.IO is a safety companion built with Expo and React Native. It helps people stay connected with their trusted contacts by offering guided onboarding, location sharing, and emergency actions in one interface.

## Features
- **Firebase authentication**: Email/password login and signup with validation.
- **Protected navigation**: Authenticated and unauthenticated stacks managed through React Navigation.
- **Safety hub**: Home screen with quick actions for live sharing, SOS, and contact management.
- **Permission onboarding**: Guided flow for location and notification access.
- **Reusable UI kit**: Gradient layouts, buttons, headers, and form inputs tailored for a calm safety-focused brand.

## Tech stack
- Expo SDK 54 / React Native 0.81
- React Navigation (stack navigator)
- Firebase Authentication
- Expo LinearGradient, Haptics, Icons

## Project structure
```
App.jsx                  ← entry point (registerRootComponent)
contexts/AuthContext.jsx ← auth state + Firebase listeners
navigation/              ← AppNavigator (private) & AuthNavigator (public)
screens/                 ← Login, Signup, Home, Permission
components/              ← Header, CustomButton, InputField, etc.
config/firebase.js       ← Firebase initialization
```

## Getting started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Expo dev server:
   ```bash
   npm start
   # or
   npx expo start
   ```
3. Choose where to run the app:
   - iOS Simulator
   - Android Emulator
   - Physical device via Expo Go

## Environment setup
- Copy your Firebase credentials into `config/firebase.js` (current file already points to the GUARD.IO project).
- Ensure you have Expo CLI prerequisites installed (Xcode for iOS simulator, Android Studio for emulator).

## Available scripts
```bash
npm start      # Expo start (interactive)
npm run ios    # Expo start --ios
npm run android# Expo start --android
npm run web    # Expo start --web
npm run lint   # Expo lint
```

## Next steps
- Wire up real permission requests (expo-location, expo-notifications).
- Implement SOS actions and contact management.
- Add analytics/monitoring for critical events.
