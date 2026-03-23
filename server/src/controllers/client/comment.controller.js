import asyncHandler from '../../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import * as commentService from '../../services/comment.service.js';

export const createRootComment = asyncHandler(async (req, res) => {
  const comment = await commentService.createRootComment({
    id_product: req.body.id_product,
    id_user: req.account.id_user,
    user_name: req.account.fullname,
    content: req.body.content,
    role: req.account.role,
  });

  return res.json({
    code: 'success',
    message: 'Bình luận gốc được tạo thành công',
    comment,
  });
});

export const getCommentsByProduct = asyncHandler(async (req, res) => {
  const commentList = await commentService.getCommentsByProduct(req.params.id_product);

  return res.json({
    code: 'success',
    message: 'Danh sách bình luận theo sản phẩm',
    commentList,
  });
});

export const createReplyComment = asyncHandler(async (req, res) => {
  const comment = await commentService.createReplyComment({
    id_product: req.body.id_product,
    id_user: req.account.id_user,
    user_name: req.account.fullname,
    content: req.body.content,
    id_parent_comment: req.body.id_parent_comment,
    reply_to_user: req.body.reply_to_user,
    role: req.account.role,
  });

  return res.json({
    code: 'success',
    message: 'Đã gửi phản hồi!',
    comment,
  });
});
