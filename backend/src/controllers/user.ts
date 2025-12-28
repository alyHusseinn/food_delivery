// users controller
// signup, login
import { Request, Response } from "express";
import db from "../config/db";
import { users, NewUser, User } from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ENV from "../config/env";
import { sendMail } from "../lib/sendmail";
import generateOTP from "../lib/generateOtp";
import z from "zod";
import { eq } from "drizzle-orm";

const userSignupSchema = z.object({
    name: z.string().min(6),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["customer", "owner"]),
});

const userLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

const otpSchema = z.object({
    email: z.string().email(),
    otp: z.number().min(100000).max(999999),
});

export const signup = async (req: Request, res: Response) => {
    try {
        const parsedData = userSignupSchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json({ error: parsedData.error.issues });
        }
        const { name, email, password, role } = parsedData.data;

        const existingUser = await db.select().from(users).where(eq(users.email, email));

        if (existingUser.length > 0 && existingUser[0].verifed == true) {
            return res.status(400).json({ error: "User already exists" });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const otp = generateOTP();
        const otpHash = await bcrypt.hash(otp, saltRounds);
        const otpCreatedAt = new Date();
        const otpExpiredAt = new Date(otpCreatedAt.getTime() + 10 * 60000); // 10 minutes

        // if user exists but not verified, update the user
        if (existingUser.length > 0 && !existingUser[0].verifed) {
            await db.update(users).set({
                name,
                passwordHash,
                role,
                otpHash,
                otpCreatedAt,
                otpExpiredAt,
            }).where(eq(users.email, email));
        } else {
            const newUser: NewUser = {
                name,
                email,
                passwordHash,
                role,
                otpHash,
                otpCreatedAt,
                otpExpiredAt,
            };
            const insertedUsers = await db.insert(users).values(newUser).returning();
        }

        await sendMail(email, parseInt(otp), name);
        res.status(201).json({ message: "User registered successfully. Please verify your email" });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const parsedData = userLoginSchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json({ error: parsedData.error.issues });
        }
        const { email, password } = parsedData.data;
        const existingUser = await db.select().from(users).where(eq(users.email, email));
        if (existingUser.length === 0) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        const user = existingUser[0];
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        const now = new Date();
        // if password is invalid and otp is expired
        if (!isPasswordValid && user.otpExpiredAt! < now) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // check if user is verified
        if (!user.verifed) {
            return res.status(400).json({ error: "Please verify your email before logging in" });
        }
        const token = jwt.sign(
            { id: user.id, email: user.email },
            ENV.JWT_SECRET,
            { expiresIn: "1d" }
        );
        res.status(200).json({ token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const parsedData = otpSchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json({ error: parsedData.error.issues });
        }
        const { email, otp } = parsedData.data;
        const existingUser = await db.select().from(users).where(eq(users.email, email));
        if (existingUser.length === 0) {
            return res.status(400).json({ error: "User not found" });
        }
        const user: User = existingUser[0];
        if (user.verifed) {
            return res.status(400).json({ error: "User already verified" });
        }
        const isOtpValid = await bcrypt.compare(otp.toString(), user.otpHash || "");
        if (!isOtpValid) {
            return res.status(400).json({ error: "Invalid OTP" });
        }
        const now = new Date();
        if (user.otpExpiredAt && now > user.otpExpiredAt) {
            return res.status(400).json({ error: "OTP has expired, please re signup again" });
        }
        await db.update(users).set({ verifed: true, otpHash: null, otpCreatedAt: null, otpExpiredAt: null }).where(eq(users.id, user.id));
        res.json({ message: "User verified successfully" });
    } catch (error) {
        console.error("OTP verification error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};