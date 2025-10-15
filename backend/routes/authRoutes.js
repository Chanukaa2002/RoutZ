import { Router } from "express";
import {
  login,
  signup,
  forgetPW,
  googleSignIn,
  githubSignIn,
  verifyOAuthLogin,
} from "../controllers/authController.js";

const router = Router();

// Email/Password Authentication
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgetPW);

// OAuth Authentication
router.post("/google", googleSignIn);
router.post("/github", githubSignIn);
router.post("/verify-oauth", verifyOAuthLogin);

export default router;
