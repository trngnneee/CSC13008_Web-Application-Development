import asyncHandler from '../../utils/asyncHandler.js';
import * as upgradeRequestService from '../../services/upgrade-request.service.js';

export const getUpgradeRequests = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.page) {
    filter.page = parseInt(req.query.page);
    filter.limit = 5;
  }

  const requests = await upgradeRequestService.getAllUpgradeRequests(filter);
  return res.json({
    code: 'success',
    message: 'Lấy danh sách yêu cầu nâng cấp thành công!',
    data: requests,
  });
});

export const getUpgradeRequestDetail = asyncHandler(async (req, res) => {
  const request = await upgradeRequestService.getUpgradeRequestDetail(req.params.id);

  if (!request) {
    return res.status(404).json({ code: 'error', message: 'Không tìm thấy yêu cầu nâng cấp!' });
  }

  return res.json({
    code: 'success',
    message: 'Lấy chi tiết yêu cầu nâng cấp thành công!',
    data: request,
  });
});

export const approveUpgradeRequest = asyncHandler(async (req, res) => {
  const result = await upgradeRequestService.approveUpgradeRequest(req.params.id, req.account?.id_user);

  if (!result) {
    return res.status(404).json({ code: 'error', message: 'Không tìm thấy yêu cầu nâng cấp!' });
  }

  return res.json({
    code: 'success',
    message: 'Đã duyệt yêu cầu nâng cấp thành công!',
    data: result,
  });
});

export const rejectUpgradeRequest = asyncHandler(async (req, res) => {
  const result = await upgradeRequestService.rejectUpgradeRequest(req.params.id, req.account?.id_user);

  if (!result) {
    return res.status(404).json({ code: 'error', message: 'Không tìm thấy yêu cầu nâng cấp!' });
  }

  return res.json({
    code: 'success',
    message: 'Đã từ chối yêu cầu nâng cấp thành công!',
    data: result,
  });
});

export const getTotalPages = asyncHandler(async (req, res) => {
  const status = req.query.status || null;
  const totalPages = await upgradeRequestService.getTotalUpgradeRequestPages(status);

  return res.json({
    code: 'success',
    message: 'Lấy tổng số trang thành công!',
    data: totalPages,
  });
});
