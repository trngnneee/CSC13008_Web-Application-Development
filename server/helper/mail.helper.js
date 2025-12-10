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
        subject: "Verify Your Email",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Email Verification</h2>
                <p>Please verify your email by clicking the button below:</p>

                <a href="${verifyURL}" 
                style="display: inline-block; padding: 10px 16px; background: #4CAF50; 
                        color: white; text-decoration: none; border-radius: 6px; margin: 10px 0;">
                    Verify Email
                </a>

                <p>If the button doesn't work, copy and paste the link below into your browser:</p>
                <p><a href="${verifyURL}">${verifyURL}</a></p>
            </div>
        `
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

export const sendNewCommentNotificationMail = async (toEmail, productName, commenterName, commentContent, productUrl) => {
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
        subject: `New Comment on Your Product "${productName}"`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Thông báo bình luận mới</h2>
            <p><strong>${commenterName}</strong> đã để lại một bình luận mới trên sản phẩm <strong>"${productName}"</strong> của bạn:</p>

            <blockquote style="border-left: 4px solid #ccc; margin: 10px 0; padding-left: 10px; color: #555;">
                ${commentContent}
            </blockquote>

            <p>Bạn có thể truy cập trang sản phẩm để xem và phản hồi bình luận.</p>

            <a href="${productUrl}" 
                style="display: inline-block; padding: 10px 16px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Xem sản phẩm
            </a>
            </div>
        `
    };
    await transporter.sendMail(mailOptions);
}