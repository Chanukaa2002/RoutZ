# Firebase Authentication Implementation Guide

## Backend Setup Complete ✅

The backend now supports:

- ✅ Email/Password Signup
- ✅ Email/Password Login
- ✅ Forgot Password (Password Reset Email)
- ✅ Google Sign-In
- ✅ GitHub Sign-In

## Backend API Endpoints

### 1. **Sign Up** - `POST /api/auth/signup`

```json
{
  "email": "admin@example.com",
  "password": "securePassword123",
  "displayName": "Admin Name"
}
```

### 2. **Login** - `POST /api/auth/login`

```json
{
  "email": "admin@example.com",
  "password": "securePassword123"
}
```

### 3. **Forgot Password** - `POST /api/auth/forgot-password`

```json
{
  "email": "admin@example.com"
}
```

### 4. **Verify OAuth Login** - `POST /api/auth/verify-oauth`

```json
{
  "uid": "firebase_user_id",
  "email": "user@example.com",
  "displayName": "User Name",
  "photoURL": "https://...",
  "provider": "google" // or "github"
}
```

## Client-Side Implementation (Frontend)

### Installation

```bash
npm install firebase
```

### Firebase Configuration (Client)

```javascript
// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB8x1Uzl518GL0TcAIFAZxgYqK7SP8NTdk",
  authDomain: "routz-26b7e.firebaseapp.com",
  projectId: "routz-26b7e",
  storageBucket: "routz-26b7e.firebasestorage.app",
  messagingSenderId: "876265950393",
  appId: "1:876265950393:web:86e6e33239f3b52abb1f68",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
```

### Google Sign-In (Client)

```javascript
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./config/firebase";

async function handleGoogleSignIn() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Send to backend for verification
    const response = await fetch(
      "http://localhost:5001/api/auth/verify-oauth",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          provider: "google",
        }),
      }
    );

    const data = await response.json();
    console.log("✅ Logged in successfully:", data);
  } catch (error) {
    console.error("❌ Google sign-in error:", error);
  }
}
```

### GitHub Sign-In (Client)

```javascript
import { signInWithPopup } from "firebase/auth";
import { auth, githubProvider } from "./config/firebase";

async function handleGithubSignIn() {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    const user = result.user;

    // Send to backend for verification
    const response = await fetch(
      "http://localhost:5001/api/auth/verify-oauth",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          provider: "github",
        }),
      }
    );

    const data = await response.json();
    console.log("✅ Logged in successfully:", data);
  } catch (error) {
    console.error("❌ GitHub sign-in error:", error);
  }
}
```

### Email/Password Sign Up (Client)

```javascript
async function handleSignup(email, password, displayName) {
  try {
    const response = await fetch("http://localhost:5001/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, displayName }),
    });

    const data = await response.json();
    if (data.success) {
      console.log("✅ Signed up successfully:", data.user);
    } else {
      console.error("❌ Signup failed:", data.message);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}
```

### Email/Password Login (Client)

```javascript
async function handleLogin(email, password) {
  try {
    const response = await fetch("http://localhost:5001/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (data.success) {
      console.log("✅ Logged in successfully:", data.user);
    } else {
      console.error("❌ Login failed:", data.message);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}
```

### Forgot Password (Client)

```javascript
async function handleForgotPassword(email) {
  try {
    const response = await fetch(
      "http://localhost:5001/api/auth/forgot-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();
    if (data.success) {
      console.log("✅ Password reset email sent");
    } else {
      console.error("❌ Failed:", data.message);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}
```

## Firebase Console Setup

### Enable Authentication Providers:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `routz-26b7e`
3. Navigate to **Authentication** → **Sign-in method**
4. Enable:
   - ✅ Email/Password
   - ✅ Google
   - ✅ GitHub

### For GitHub OAuth:

1. Go to GitHub Developer Settings: https://github.com/settings/developers
2. Create a New OAuth App
3. Set Authorization callback URL to: `https://routz-26b7e.firebaseapp.com/__/auth/handler`
4. Copy Client ID and Client Secret to Firebase Console

## Database Structure (Firestore)

### Collection: `admins`

```
admins/{uid}
  ├── uid: string
  ├── email: string
  ├── displayName: string
  ├── photoURL: string (optional)
  ├── role: "admin"
  ├── provider: "email" | "google" | "github"
  ├── createdAt: timestamp
  └── lastLogin: timestamp
```

## Testing

Use the provided `test-auth.http` file with REST Client extension in VS Code to test all endpoints.

## Security Notes

⚠️ **Important**: Your Firebase API key is now in the code. For production:

1. Move sensitive config to `.env` file
2. Add `.env` to `.gitignore`
3. Never commit API keys to GitHub
4. Use Firebase Security Rules to restrict database access
5. Implement proper session management (JWT tokens)

## Next Steps

1. ✅ Backend authentication is complete
2. 🔄 Implement frontend UI components
3. 🔄 Add JWT token generation for session management
4. 🔄 Add middleware to protect admin routes
5. 🔄 Set up Firestore security rules
