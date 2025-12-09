import { formatDate } from "../../helper/date.helper.js";
import * as upgradeRequestService from "../../service/upgrade_request.service.js";
import * as userService from "../../service/user.service.js";
import bcrypt from "bcryptjs";

export const requestUpgradeToSeller = async (req, res) => {
  const id_user = req.account?.id_user; // From middleware
  const userRole = req.account?.role; // From middleware

  try {
    // Check if user is already admin
    if (userRole === "admin") {
      return res.status(400).json({
        code: "error",
        message: "Admin không thể nâng cấp thành seller!"
      });
    }

    // Check if user is already seller
    if (userRole === "seller") {
      return res.status(400).json({
        code: "error",
        message: "Bạn đã là seller rồi!"
      });
    }

    // Check if user already has a pending request
    const existingRequest = await upgradeRequestService.checkExistingRequest(id_user);

    if (existingRequest) {
      return res.status(400).json({
        code: "error",
        message: "Bạn đã có một yêu cầu nâng cấp đang chờ xử lý!"
      });
    }

    // Create new upgrade request
    const request = await upgradeRequestService.createUpgradeRequest(id_user);

    return res.json({
      code: "success",
      message: "Gửi yêu cầu nâng cấp thành công! Vui lòng chờ admin duyệt.",
      data: request
    });
  } catch (error) {
    return res.status(500).json({
      code: "error",
      message: "Lỗi khi gửi yêu cầu nâng cấp!",
      data: error?.message || error
    });
  }
};

export const getMyUpgradeRequest = async (req, res) => {
  const id_user = req.account?.id_user; // From middleware

  try {
    const request = await upgradeRequestService.checkExistingRequest(id_user);

    if (!request) {
      return res.status(404).json({
        code: "error",
        message: "Không có yêu cầu nâng cấp nào!"
      });
    }

    return res.json({
      code: "success",
      message: "Lấy yêu cầu nâng cấp thành công!",
      data: request
    });
  } catch (error) {
    return res.status(500).json({
      code: "error",
      message: "Lỗi khi lấy yêu cầu nâng cấp!",
      data: error?.message || error
    });
  }
};

export const updateClientProfile = async (req, res) => {
  const id_user = req.account?.id_user; // From middleware
  const { fullname, date_of_birth } = req.body;

  await userService.updateUserById(id_user, { fullname, date_of_birth: formatDate(date_of_birth) });
  
  res.json({
    code: "success",
    message: "Cập nhật thông tin cá nhân thành công!",
  })
}

export const resetClientPassword = async (req, res) => {
  const id_user = req.account?.id_user; // From middleware
  const { old_password, password } = req.body;

  const existUser = await userService.findUserById(id_user);
  if (!existUser) {
    return res.json({
      code: "error",
      message: "Người dùng không tồn tại!",
    });
  }

  if (!bcrypt.compareSync(old_password, existUser.password)) {
    return res.json({
      code: "error",
      message: "Mật khẩu cũ không chính xác!"
    });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashPassword = bcrypt.hashSync(password, salt);

  await userService.resetPassword(id_user, hashPassword);

  res.json({
    code: "success",
    message: "Đổi mật khẩu thành công!",
  })
}