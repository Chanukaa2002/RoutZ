import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig.js";

export const signup = async (req, res) => {
  const { email, password, displayName } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password should be at least 6 characters",
      });
    }

    // Create user with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Save user data to Firestore
    await setDoc(doc(db, "admins", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName || email.split("@")[0],
      role: "admin",
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      provider: "email",
    });

    console.log("✅ Admin signed up successfully:", {
      uid: user.uid,
      email: user.email,
      displayName: displayName || email.split("@")[0],
    });

    return res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      user: {
        uid: user.uid,
        email: user.email,
        displayName: displayName || email.split("@")[0],
      },
    });
  } catch (error) {
    console.error("❌ Signup error:", error.message);

    let errorMessage = "Failed to create admin account";

    if (error.code === "auth/email-already-in-use") {
      errorMessage = "Email is already registered";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email address";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Password is too weak";
    }

    return res.status(400).json({
      success: false,
      message: errorMessage,
      error: error.message,
    });
  }
};

// Login with email and password
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Sign in user with Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Update last login time in Firestore
    const adminRef = doc(db, "admins", user.uid);
    const adminDoc = await getDoc(adminRef);

    if (adminDoc.exists()) {
      await setDoc(
        adminRef,
        {
          lastLogin: serverTimestamp(),
        },
        { merge: true }
      );
    }

    console.log("✅ Admin logged in successfully:", {
      uid: user.uid,
      email: user.email,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        uid: user.uid,
        email: user.email,
        displayName: adminDoc.exists()
          ? adminDoc.data().displayName
          : email.split("@")[0],
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error.message);

    let errorMessage = "Failed to login";

    if (error.code === "auth/user-not-found") {
      errorMessage = "No account found with this email";
    } else if (error.code === "auth/wrong-password") {
      errorMessage = "Incorrect password";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email address";
    } else if (error.code === "auth/user-disabled") {
      errorMessage = "This account has been disabled";
    } else if (error.code === "auth/invalid-credential") {
      errorMessage = "Invalid email or password";
    }

    return res.status(401).json({
      success: false,
      message: errorMessage,
      error: error.message,
    });
  }
};

// Forgot password - Send password reset email
export const forgetPW = async (req, res) => {
  const { email } = req.body;

  try {
    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Send password reset email
    await sendPasswordResetEmail(auth, email);

    console.log("✅ Password reset email sent to:", email);

    return res.status(200).json({
      success: true,
      message:
        "Password reset email sent successfully. Please check your inbox.",
    });
  } catch (error) {
    console.error("❌ Password reset error:", error.message);

    let errorMessage = "Failed to send password reset email";

    if (error.code === "auth/user-not-found") {
      errorMessage = "No account found with this email";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email address";
    }

    return res.status(400).json({
      success: false,
      message: errorMessage,
      error: error.message,
    });
  }
};

// Google Sign-In
export const googleSignIn = async (req, res) => {
  try {
    const provider = new GoogleAuthProvider();

    // Note: This approach requires client-side implementation
    // The client should call Firebase directly and send the token to backend
    return res.status(200).json({
      success: true,
      message: "Google sign-in should be handled on the client side",
      instructions:
        "Use signInWithPopup(auth, provider) on the client and send the result to backend for verification",
    });
  } catch (error) {
    console.error("❌ Google sign-in error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Google sign-in failed",
      error: error.message,
    });
  }
};

// GitHub Sign-In
export const githubSignIn = async (req, res) => {
  try {
    const provider = new GithubAuthProvider();

    // Note: This approach requires client-side implementation
    // The client should call Firebase directly and send the token to backend
    return res.status(200).json({
      success: true,
      message: "GitHub sign-in should be handled on the client side",
      instructions:
        "Use signInWithPopup(auth, provider) on the client and send the result to backend for verification",
    });
  } catch (error) {
    console.error("❌ GitHub sign-in error:", error.message);
    return res.status(500).json({
      success: false,
      message: "GitHub sign-in failed",
      error: error.message,
    });
  }
};

// Verify OAuth login (called after client-side OAuth)
export const verifyOAuthLogin = async (req, res) => {
  const { uid, email, displayName, photoURL, provider } = req.body;

  try {
    if (!uid || !email) {
      return res.status(400).json({
        success: false,
        message: "User ID and email are required",
      });
    }

    // Check if admin exists in Firestore
    const adminRef = doc(db, "admins", uid);
    const adminDoc = await getDoc(adminRef);

    if (adminDoc.exists()) {
      // Update existing admin
      await setDoc(
        adminRef,
        {
          lastLogin: serverTimestamp(),
        },
        { merge: true }
      );
    } else {
      // Create new admin document
      await setDoc(adminRef, {
        uid,
        email,
        displayName: displayName || email.split("@")[0],
        photoURL: photoURL || null,
        role: "admin",
        provider: provider || "oauth",
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });
    }

    console.log(`✅ Admin logged in via ${provider || "OAuth"}:`, {
      uid,
      email,
      displayName,
    });

    return res.status(200).json({
      success: true,
      message: "OAuth login successful",
      user: {
        uid,
        email,
        displayName: displayName || email.split("@")[0],
        photoURL,
      },
    });
  } catch (error) {
    console.error("❌ OAuth verification error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to verify OAuth login",
      error: error.message,
    });
  }
};
