import asyncHandler from '../../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import * as bidService from '../../services/bid.service.js';
import { findUserById } from '../../services/user.service.js';
import { sendKickBidderMail, sendRecoveryMail } from '../../services/mail.service.js';
import db from '../../config/database.js';

export const placeBid = asyncHandler(async (req, res) => {
  const { id_product, bid_price, id_user } = req.body;
  const result = await bidService.placeBid(id_product, bid_price, id_user);
  return res.json({ code: result.status, message: result.message, data: result.data });
});

export const getBidRequests = asyncHandler(async (req, res) => {
  const id_seller = req.account?.id_user;
  if (!id_seller) return errorResponse(res, { message: 'Không tìm thấy thông tin người bán' });

  const result = await bidService.getBidRequests(id_seller);
  return res.json({ code: 'success', message: 'Bid requests retrieved successfully', data: result });
});

export const approveBidRequest = asyncHandler(async (req, res) => {
  const result = await bidService.approveBidRequest(req.body.id_request, req.account.id_user);
  return successResponse(res, { message: 'Đã phê duyệt yêu cầu đấu giá', data: { data: result } });
});

export const rejectBidRequest = asyncHandler(async (req, res) => {
  const result = await bidService.rejectBidRequest(req.body.id_request, req.account.id_user);
  return successResponse(res, { message: 'Đã từ chối yêu cầu đấu giá', data: { data: result } });
});

export const getBidRequestsByProduct = asyncHandler(async (req, res) => {
  const { id_product } = req.params;
  if (!id_product) return errorResponse(res, { message: 'Không tìm thấy id sản phẩm' });

  const result = await bidService.getBidRequestsByProduct(id_product);
  return res.json({ code: 'success', data: result });
});

export const getMyBiddingProducts = asyncHandler(async (req, res) => {
  const id_user = req.account?.id_user;
  if (!id_user) return errorResponse(res, { message: 'Không tìm thấy thông tin người dùng' });

  const result = await bidService.getMyBiddingProducts(id_user);
  return res.json({ code: 'success', message: 'Lấy danh sách sản phẩm đang đấu giá thành công', data: result });
});

export const getBidderListByProduct = asyncHandler(async (req, res) => {
  const { id_product } = req.params;
  if (!id_product) return errorResponse(res, { message: 'Không tìm thấy id sản phẩm' });

  const result = await bidService.getBidderListByProduct(id_product);
  return res.json({ code: 'success', data: result });
});

export const kickBidder = asyncHandler(async (req, res) => {
  const { id_product, id_bidder } = req.body;
  await bidService.kickBidderFromProduct(id_product, id_bidder);

  const bidderInfo = await findUserById(id_bidder);
  const sellerInfo = await db('user').join('product', 'user.id_user', 'product.created_by').select('user.fullname').where('product.id_product', id_product).first();
  const productInfo = await db('product').select('name').where('id_product', id_product).first();

  await sendKickBidderMail(bidderInfo.email, productInfo.name, sellerInfo.fullname);
  return successResponse(res, { message: 'Đã kick người đấu giá khỏi sản phẩm đấu giá' });
});

export const recoverBidder = asyncHandler(async (req, res) => {
  const { id_product, id_bidder } = req.body;
  await bidService.recoverBidderToProduct(id_product, id_bidder);

  const bidderInfo = await findUserById(id_bidder);
  const sellerInfo = await db('user').join('product', 'user.id_user', 'product.created_by').select('user.fullname').where('product.id_product', id_product).first();
  const productInfo = await db('product').select('name').where('id_product', id_product).first();

  await sendRecoveryMail(bidderInfo.email, productInfo.name, sellerInfo.fullname);
  return successResponse(res, { message: 'Đã phục hồi người đấu giá cho sản phẩm đấu giá' });
});

export const placeAutoBid = asyncHandler(async (req, res) => {
  const { id_product, max_bid } = req.body;
  if (!id_product || !max_bid) return errorResponse(res, { message: 'Thiếu thông tin: id_product và max_bid là bắt buộc' });

  const result = await bidService.placeAutoBid(id_product, max_bid, req.account.id_user);
  return res.json({ code: 'success', message: result.message, data: result.data });
});

export const getAutoBid = asyncHandler(async (req, res) => {
  const autoBid = await bidService.getAutoBid(req.params.id_product, req.account.id_user);
  return res.json({ code: 'success', data: autoBid });
});

export const deleteAutoBid = asyncHandler(async (req, res) => {
  const result = await bidService.deleteAutoBid(req.params.id_product, req.account.id_user);
  return successResponse(res, { message: result.message });
});
