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

export const sendResetPasswordMail = async (toEmail, newPassword) => {
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
        subject: "Mật khẩu của bạn đã được đặt lại",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Thông báo đặt lại mật khẩu</h2>
                <p>Mật khẩu tài khoản của bạn đã được đặt lại bởi quản trị viên.</p>
                <p>Mật khẩu mới của bạn là:</p>
                <h3 style="color: #2B3674; font-size: 24px; background: #f5f5f5; padding: 10px 20px; border-radius: 6px; display: inline-block;">${newPassword}</h3>
                <p style="color: #e74c3c;"><strong>Vui lòng đổi mật khẩu ngay sau khi đăng nhập để bảo mật tài khoản.</strong></p>
                <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng liên hệ với quản trị viên.</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
}

export const sendAuctionEndedNoWinnerMail = async (toEmail, productName, sellerName) => {
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
        subject: `Đấu giá kết thúc - "${productName}"`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Thông báo kết thúc đấu giá</h2>
                <p>Xin chào <strong>${sellerName}</strong>,</p>
                <p>Cuộc đấu giá cho sản phẩm <strong>"${productName}"</strong> đã kết thúc.</p>
                <p style="color: #e74c3c;"><strong>Rất tiếc, không có ai tham gia đấu giá cho sản phẩm này.</strong></p>
                <p>Bạn có thể tạo một phiên đấu giá mới cho sản phẩm nếu muốn.</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
}

export const sendAuctionSuccessMail = async (toEmail, productName, sellerName, winnerName, finalPrice) => {
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
        subject: `Đấu giá thành công - "${productName}"`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>🎉 Chúc mừng! Đấu giá thành công</h2>
                <p>Xin chào <strong>${sellerName}</strong>,</p>
                <p>Cuộc đấu giá cho sản phẩm <strong>"${productName}"</strong> đã kết thúc thành công!</p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p><strong>Người thắng:</strong> ${winnerName}</p>
                    <p><strong>Giá cuối cùng:</strong> ${parseInt(finalPrice).toLocaleString("vi-VN")} VND</p>
                </div>
                <p>Vui lòng truy cập hệ thống để hoàn tất giao dịch với người mua.</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
}

export const sendAuctionWonMail = async (toEmail, productName, winnerName, finalPrice) => {
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
        subject: `Chúc mừng! Bạn đã thắng đấu giá - "${productName}"`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>🎉 Chúc mừng! Bạn đã thắng đấu giá</h2>
                <p>Xin chào <strong>${winnerName}</strong>,</p>
                <p>Bạn đã thắng cuộc đấu giá cho sản phẩm <strong>"${productName}"</strong>!</p>
                <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #c3e6cb;">
                    <p><strong>Giá thắng:</strong> ${parseInt(finalPrice).toLocaleString("vi-VN")} VND</p>
                </div>
                <p>Vui lòng truy cập hệ thống để:</p>
                <ol>
                    <li>Tải lên hóa đơn thanh toán</li>
                    <li>Cung cấp địa chỉ giao hàng</li>
                </ol>
                <p>Người bán sẽ xác nhận và gửi hàng cho bạn.</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
}