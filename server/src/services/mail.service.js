import transporter from '../config/mail.js';

const sendMail = async (to, subject, html) => {
  return transporter.sendMail({
    from: process.env.EMAIL_NAME,
    to,
    subject,
    html,
  });
};

export const sendVerifyMail = async (toEmail, verifyToken, role = 'bidder') => {
  const apiPath = role === 'admin' ? '/admin' : '';
  const verifyURL = `${process.env.BASE_URL || 'http://localhost:10000'}/api${apiPath}/account/verify-email?token=${verifyToken}`;

  await sendMail(toEmail, 'Verify Your Email', `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Email Verification</h2>
      <p>Please verify your email by clicking the button below:</p>
      <a href="${verifyURL}" style="display: inline-block; padding: 10px 16px; background: #4CAF50; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0;">
        Verify Email
      </a>
      <p>If the button doesn't work, copy and paste the link below into your browser:</p>
      <p><a href="${verifyURL}">${verifyURL}</a></p>
    </div>
  `);
};

export const sendOTPMail = async (toEmail, otp) => {
  await sendMail(toEmail, 'Your OTP Code - Password Reset', `
    <h2>Password Reset Request</h2>
    <p>Your OTP code is:</p>
    <h3 style="color: #2B3674; font-size: 24px; letter-spacing: 5px;">${otp}</h3>
    <p>This code will expire in 5 minutes.</p>
    <p>If you didn't request a password reset, please ignore this email.</p>
  `);
};

export const sendNewCommentNotificationMail = async (toEmail, productName, commenterName, commentContent, productUrl) => {
  await sendMail(toEmail, `New Comment on Your Product "${productName}"`, `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Thông báo bình luận mới</h2>
      <p><strong>${commenterName}</strong> đã để lại một bình luận mới trên sản phẩm <strong>"${productName}"</strong> của bạn:</p>
      <blockquote style="border-left: 4px solid #ccc; margin: 10px 0; padding-left: 10px; color: #555;">
        ${commentContent}
      </blockquote>
      <p>Bạn có thể truy cập trang sản phẩm để xem và phản hồi bình luận.</p>
      <a href="${productUrl}" style="display: inline-block; padding: 10px 16px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Xem sản phẩm
      </a>
    </div>
  `);
};

export const sendResetPasswordMail = async (toEmail, newPassword) => {
  await sendMail(toEmail, 'Mật khẩu của bạn đã được đặt lại', `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Thông báo đặt lại mật khẩu</h2>
      <p>Mật khẩu tài khoản của bạn đã được đặt lại bởi quản trị viên.</p>
      <p>Mật khẩu mới của bạn là:</p>
      <h3 style="color: #2B3674; font-size: 24px; background: #f5f5f5; padding: 10px 20px; border-radius: 6px; display: inline-block;">${newPassword}</h3>
      <p style="color: #e74c3c;"><strong>Vui lòng đổi mật khẩu ngay sau khi đăng nhập để bảo mật tài khoản.</strong></p>
    </div>
  `);
};

export const sendAuctionEndedNoWinnerMail = async (toEmail, productName, sellerName) => {
  await sendMail(toEmail, `Đấu giá kết thúc - "${productName}"`, `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Thông báo kết thúc đấu giá</h2>
      <p>Xin chào <strong>${sellerName}</strong>,</p>
      <p>Cuộc đấu giá cho sản phẩm <strong>"${productName}"</strong> đã kết thúc.</p>
      <p style="color: #e74c3c;"><strong>Rất tiếc, không có ai tham gia đấu giá cho sản phẩm này.</strong></p>
    </div>
  `);
};

export const sendAuctionSuccessMail = async (toEmail, productName, sellerName, winnerName, finalPrice) => {
  await sendMail(toEmail, `Đấu giá thành công - "${productName}"`, `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Chúc mừng! Đấu giá thành công</h2>
      <p>Xin chào <strong>${sellerName}</strong>,</p>
      <p>Cuộc đấu giá cho sản phẩm <strong>"${productName}"</strong> đã kết thúc thành công!</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p><strong>Người thắng:</strong> ${winnerName}</p>
        <p><strong>Giá cuối cùng:</strong> ${parseInt(finalPrice).toLocaleString('vi-VN')} VND</p>
      </div>
    </div>
  `);
};

export const sendAuctionWonMail = async (toEmail, productName, winnerName, finalPrice) => {
  await sendMail(toEmail, `Chúc mừng! Bạn đã thắng đấu giá - "${productName}"`, `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Chúc mừng! Bạn đã thắng đấu giá</h2>
      <p>Xin chào <strong>${winnerName}</strong>,</p>
      <p>Bạn đã thắng cuộc đấu giá cho sản phẩm <strong>"${productName}"</strong>!</p>
      <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p><strong>Giá thắng:</strong> ${parseInt(finalPrice).toLocaleString('vi-VN')} VND</p>
      </div>
    </div>
  `);
};

export const sendBidSuccessMail = async (toEmail, bidderName, productName, bidPrice, productUrl) => {
  await sendMail(toEmail, `Đặt giá thành công - "${productName}"`, `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Đặt giá thành công</h2>
      <p>Xin chào <strong>${bidderName}</strong>,</p>
      <p>Bạn đã đặt giá thành công cho sản phẩm <strong>"${productName}"</strong>!</p>
      <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p><strong>Giá đặt:</strong> ${parseInt(bidPrice).toLocaleString('vi-VN')} VND</p>
      </div>
      <a href="${productUrl}" style="display: inline-block; padding: 10px 16px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Xem sản phẩm
      </a>
    </div>
  `);
};

export const sendNewBidNotificationMail = async (toEmail, sellerName, productName, bidderName, bidPrice, productUrl) => {
  await sendMail(toEmail, `Có người đặt giá mới - "${productName}"`, `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Thông báo đặt giá mới</h2>
      <p>Xin chào <strong>${sellerName}</strong>,</p>
      <p>Có người vừa đặt giá cho sản phẩm <strong>"${productName}"</strong> của bạn!</p>
      <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p><strong>Người đặt giá:</strong> ${bidderName}</p>
        <p><strong>Giá đặt:</strong> ${parseInt(bidPrice).toLocaleString('vi-VN')} VND</p>
      </div>
      <a href="${productUrl}" style="display: inline-block; padding: 10px 16px; background-color: #ff9800; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Xem sản phẩm
      </a>
    </div>
  `);
};

export const sendOutbidNotificationMail = async (toEmail, bidderName, productName, newBidPrice, productUrl) => {
  await sendMail(toEmail, `Có người đặt giá cao hơn - "${productName}"`, `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Có người đặt giá cao hơn</h2>
      <p>Xin chào <strong>${bidderName}</strong>,</p>
      <p>Có người vừa đặt giá cao hơn bạn cho sản phẩm <strong>"${productName}"</strong>!</p>
      <div style="background: #ffebee; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p><strong>Giá hiện tại:</strong> ${parseInt(newBidPrice).toLocaleString('vi-VN')} VND</p>
      </div>
      <a href="${productUrl}" style="display: inline-block; padding: 10px 16px; background-color: #f44336; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Đặt giá ngay
      </a>
    </div>
  `);
};

export const sendKickBidderMail = async (toEmail, productName, sellerName) => {
  await sendMail(toEmail, `Thông báo bị loại khỏi đấu giá - "${productName}"`, `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Thông báo loại khỏi đấu giá</h2>
      <p>Bạn đã bị loại khỏi cuộc đấu giá cho sản phẩm <strong>"${productName}"</strong> bởi người bán <strong>${sellerName}</strong>.</p>
    </div>
  `);
};

export const sendRecoveryMail = async (toEmail, productName, sellerName) => {
  await sendMail(toEmail, `Thông báo phục hồi đấu giá - "${productName}"`, `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Thông báo phục hồi đấu giá</h2>
      <p>Bạn đã được phục hồi tham gia cuộc đấu giá cho sản phẩm <strong>"${productName}"</strong> bởi người bán <strong>${sellerName}</strong>.</p>
    </div>
  `);
};

export const sendDescriptionChangeMail = async (toEmail, bidderName, productName, productUrl) => {
  await sendMail(toEmail, `Mô tả sản phẩm đã được cập nhật - "${productName}"`, `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Thông báo cập nhật mô tả sản phẩm</h2>
      <p>Xin chào <strong>${bidderName}</strong>,</p>
      <p>Người bán vừa cập nhật mô tả cho sản phẩm <strong>"${productName}"</strong> mà bạn đang tham gia đấu giá.</p>
      <a href="${productUrl}" style="display: inline-block; padding: 10px 16px; background-color: #2196f3; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Xem mô tả mới
      </a>
    </div>
  `);
};
