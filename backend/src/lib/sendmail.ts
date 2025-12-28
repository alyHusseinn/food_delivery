import nodemailer from "nodemailer";
import ENV from "../config/env";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ENV.GMAIL_USER,
    pass: ENV.GMAIL_PASS,
  },
});

export const sendMail = async (to: string, otp: number, name: string) => {
  const mailOptions = {
    from: ENV.GMAIL_USER,   
    to,
    subject: "Verification Code",
    html: `
    <h1>Hello, ${name}, Welcome! to Food Delivery application</h1>
    <p>Your verification code is:</p>
    <h2>${otp}</h2>
    <p>This code expires in 10 minutes.</p>
  `,
  };
    await transporter.sendMail(mailOptions);
};