import * as upgradeRequestService from "../../service/upgrade_request.service.js";

export const getUpgradeRequests = async (req, res) => {
  try {
    let filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.page) {
      filter.page = parseInt(req.query.page);
      filter.limit = 5;
    }

    const requests = await upgradeRequestService.getAllUpgradeRequests(filter);

    return res.json({
      code: "success",
      message: "Lấy danh sách yêu cầu nâng cấp thành công!",
      data: requests
    });
  } catch (error) {
    return res.status(500).json({
      code: "error",
      message: "Lỗi khi lấy danh sách yêu cầu nâng cấp!",
      data: error?.message || error
    });
  }
};

export const getUpgradeRequestDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const request = await upgradeRequestService.getUpgradeRequestDetail(id);

    if (!request) {
      return res.status(404).json({
        code: "error",
        message: "Không tìm thấy yêu cầu nâng cấp!"
      });
    }

    return res.json({
      code: "success",
      message: "Lấy chi tiết yêu cầu nâng cấp thành công!",
      data: request
    });
  } catch (error) {
    return res.status(500).json({
      code: "error",
      message: "Lỗi khi lấy chi tiết yêu cầu nâng cấp!",
      data: error?.message || error
    });
  }
};

export const approveUpgradeRequest = async (req, res) => {
  const { id } = req.params;
  const id_admin = req.account?.id_user; // From middleware

  try {
    const request = await upgradeRequestService.approveUpgradeRequest(id, id_admin);

    if (!request) {
      return res.status(404).json({
        code: "error",
        message: "Không tìm thấy yêu cầu nâng cấp!"
      });
    }

    return res.json({
      code: "success",
      message: "Đã duyệt yêu cầu nâng cấp thành công!",
      data: request
    });
  } catch (error) {
    return res.status(500).json({
      code: "error",
      message: "Lỗi khi duyệt yêu cầu nâng cấp!",
      data: error?.message || error
    });
  }
};

export const rejectUpgradeRequest = async (req, res) => {
  const { id } = req.params;
  const id_admin = req.account?.id_user; // From middleware

  try {
    const request = await upgradeRequestService.rejectUpgradeRequest(id, id_admin);

    if (!request) {
      return res.status(404).json({
        code: "error",
        message: "Không tìm thấy yêu cầu nâng cấp!"
      });
    }

    return res.json({
      code: "success",
      message: "Đã từ chối yêu cầu nâng cấp thành công!",
      data: request
    });
  } catch (error) {
    return res.status(500).json({
      code: "error",
      message: "Lỗi khi từ chối yêu cầu nâng cấp!",
      data: error?.message || error
    });
  }
};

export const getTotalPages = async (req, res) => {
  try {
    const status = req.query.status || null;
    const totalPages = await upgradeRequestService.getTotalUpgradeRequestPages(status);

    return res.json({
      code: "success",
      message: "Lấy tổng số trang thành công!",
      data: totalPages
    });
  } catch (error) {
    return res.status(500).json({
      code: "error",
      message: "Lỗi khi lấy tổng số trang!",
      data: error?.message || error
    });
  }
};
