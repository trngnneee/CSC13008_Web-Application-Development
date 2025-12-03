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