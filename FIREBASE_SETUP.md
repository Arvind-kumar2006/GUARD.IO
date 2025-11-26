# Firebase Authentication Setup Guide

Firebase Authentication has been integrated into your login and signup screens. Follow these steps to complete the setup:

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter your project name (e.g., "GUARD.IO")
   - Enable/disable Google Analytics (optional)
   - Click "Create project"

## Step 2: Enable Email/Password Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get started** (if you haven't enabled it yet)
3. Go to the **Sign-in method** tab
4. Click on **Email/Password**
5. Enable the first toggle (Email/Password)
6. Click **Save**

## Step 3: Get Your Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select **Project settings**
3. Scroll down to the **Your apps** section
4. Click the **Web** icon (`</>`) to add a web app
5. Register your app with a nickname (e.g., "GUARD.IO Web")
6. Copy the Firebase configuration object

## Step 4: Update Firebase Configuration in Your App

1. Open `/config/firebase.ts` in your project
2. Replace the placeholder values with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',                    // Replace with your apiKey
  authDomain: 'YOUR_AUTH_DOMAIN',            // Replace with your authDomain
  projectId: 'YOUR_PROJECT_ID',              // Replace with your projectId
  storageBucket: 'YOUR_STORAGE_BUCKET',      // Replace with your storageBucket
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID', // Replace with your messagingSenderId
  appId: 'YOUR_APP_ID',                      // Replace with your appId
};
```

**Example:**
```typescript
const firebaseConfig = {
  apiKey: 'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  authDomain: 'guard-io.firebaseapp.com',
  projectId: 'guard-io',
  storageBucket: 'guard-io.appspot.com',
  messagingSenderId: '123456789012',
  appId: '1:123456789012:web:abcdef1234567890',
};
```

## Step 5: Test Your Setup

1. Run your app: `npm start` or `expo start`
2. Try creating a new account using the Sign Up screen
3. Try logging in with the credentials you just created

## Features Implemented

✅ **Login Screen:**
- Email/password authentication
- Form validation
- Error handling with user-friendly messages
- Loading states

✅ **Sign Up Screen:**
- User registration with email/password
- Full name stored in user profile
- Password confirmation validation
- Error handling with user-friendly messages
- Loading states

✅ **Auth Context:**
- Automatic authentication state management
- Persistent login (users stay logged in)
- User information available throughout the app

## Security Notes

⚠️ **Important:** The Firebase config in your code is safe to expose in client-side applications. Firebase uses security rules to protect your backend. However, make sure to:

1. Set up proper Firebase Security Rules for Firestore/Storage if you use them
2. Enable App Check for additional security (optional but recommended)
3. Never commit sensitive API keys or service account keys to version control

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
- Make sure you copied the correct API key from Firebase Console
- Verify all config values are correct

### "Firebase: Error (auth/operation-not-allowed)"
- Go to Firebase Console → Authentication → Sign-in method
- Make sure Email/Password is enabled

### Network errors
- Check your internet connection
- Verify Firebase project is active
- Check if there are any Firebase service outages

## Next Steps (Optional)

You can extend this implementation with:
- Password reset functionality
- Email verification
- Social authentication (Google, Facebook, etc.)
- User profile management
- Storing additional user data in Firestore

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Expo Firebase Guide](https://docs.expo.dev/guides/using-firebase/)

