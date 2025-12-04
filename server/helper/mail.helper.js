import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const sendVarifyMail = async (toEmail, verifyToken, role = "bidder") => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_NAME,
            pass: process.env.EMAIL_PASSWORD,
        }
    });

    const apiPath = role === "admin" ? "/admin" : "";
    const verifyURL = `http://localhost:10000/api${apiPath}/account/verify-email?token=${verifyToken}`;

    const mailOptions = {
        from: process.env.EMAIL_NAME,
        to: toEmail,
        subject: "Verify your email",
        html: `<p>Please verify your email by clicking the link below:</p><a href="${verifyURL}">${verifyURL}</a>`
    };

    await transporter.sendMail(mailOptions);
}

export const sendOTPMail = async (toEmail, otp) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_NAME,
            pass: process.env.EMAIL_PASSWORD,
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_NAME,
        to: toEmail,
        subject: "Your OTP Code - Password Reset",
        html: `
            <h2>Password Reset Request</h2>
            <p>Your OTP code is:</p>
            <h3 style="color: #2B3674; font-size: 24px; letter-spacing: 5px;">${otp}</h3>
            <p>This code will expire in 5 minutes.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
        `
    };

    await transporter.sendMail(mailOptions);
}