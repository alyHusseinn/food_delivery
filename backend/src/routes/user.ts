// user routes
import { Router } from "express";
import { signup, login, verifyOtp } from "../controllers/user";

const router = Router();
router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);

export default router;