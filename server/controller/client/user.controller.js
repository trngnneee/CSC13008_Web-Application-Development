import * as upgradeRequestService from "../../service/upgrade_request.service.js";

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
