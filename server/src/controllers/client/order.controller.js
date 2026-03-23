import asyncHandler from '../../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import * as auctionService from '../../services/auction.service.js';

export const getMyWonOrders = asyncHandler(async (req, res) => {
  const orders = await auctionService.getWinnerOrdersByUser(req.account.id_user);
  return res.json({ code: 'success', data: orders });
});

export const getMySoldOrders = asyncHandler(async (req, res) => {
  const orders = await auctionService.getWinnerOrdersBySeller(req.account.id_user);
  return res.json({ code: 'success', data: orders });
});

export const getOrderByProduct = asyncHandler(async (req, res) => {
  const { id_product } = req.params;
  const id_user = req.account.id_user;

  const order = await auctionService.getWinnerOrderByProduct(id_product);

  if (!order) {
    return res.status(404).json({ code: 'error', message: 'Không tìm thấy đơn hàng' });
  }

  const isWinner = order.id_user === id_user;
  const isSeller = order.seller_id === id_user;

  if (!isWinner && !isSeller) {
    return res.status(403).json({ code: 'error', message: 'Bạn không có quyền xem đơn hàng này' });
  }

  return res.json({
    code: 'success',
    data: { ...order, isWinner, isSeller },
  });
});

export const submitPayment = asyncHandler(async (req, res) => {
  const { id_order, address } = req.body;
  const payment_bill = req.file ? req.file.path : null;

  if (!payment_bill || !address) {
    return res.status(400).json({ code: 'error', message: 'Vui lòng cung cấp đầy đủ thông tin (ảnh hóa đơn và địa chỉ)' });
  }

  const result = await auctionService.submitPaymentInfo(id_order, req.account.id_user, payment_bill, address);
  return res.json({ code: 'success', message: 'Đã gửi thông tin thanh toán', data: result });
});

export const confirmPayment = asyncHandler(async (req, res) => {
  const { id_order } = req.body;
  const b_l = req.file ? req.file.path : null;

  const result = await auctionService.confirmPaymentAndShip(id_order, req.account.id_user, b_l);
  return res.json({ code: 'success', message: 'Đã xác nhận thanh toán và gửi hàng', data: result });
});

export const confirmReceived = asyncHandler(async (req, res) => {
  const { id_order } = req.body;
  const result = await auctionService.confirmReceived(id_order, req.account.id_user);
  return res.json({ code: 'success', message: 'Đã xác nhận nhận hàng', data: result });
});

export const rateOrder = asyncHandler(async (req, res) => {
  const { id_order, score, comment } = req.body;

  if (score !== 1 && score !== -1) {
    return res.status(400).json({ code: 'error', message: 'Điểm đánh giá phải là +1 hoặc -1' });
  }
  if (comment && comment.length > 500) {
    return res.status(400).json({ code: 'error', message: 'Bình luận không được vượt quá 500 ký tự' });
  }

  const result = await auctionService.rateOrder(id_order, req.account.id_user, score, comment);
  return res.json({ code: 'success', message: 'Đã đánh giá thành công', data: result });
});

export const getRatingStatus = asyncHandler(async (req, res) => {
  const result = await auctionService.getRatingStatus(req.params.id_order, req.account.id_user);
  return res.json({ code: 'success', data: result });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const { id_order } = req.body;
  const result = await auctionService.cancelOrder(id_order, req.account.id_user);
  return res.json({ code: 'success', message: 'Đã hủy đơn hàng', data: result });
});
