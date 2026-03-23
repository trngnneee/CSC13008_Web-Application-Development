import Joi from 'joi';

export const createCommentSchema = Joi.object({
  id_product: Joi.string().uuid().required().messages({
    'string.guid': 'ID sản phẩm không hợp lệ',
    'any.required': 'ID sản phẩm là bắt buộc',
  }),
  content: Joi.string().trim().min(1).max(2000).required().messages({
    'string.empty': 'Nội dung bình luận không được để trống',
    'string.max': 'Nội dung bình luận tối đa 2000 ký tự',
  }),
});

export const replyCommentSchema = Joi.object({
  id_product: Joi.string().uuid().required().messages({
    'string.guid': 'ID sản phẩm không hợp lệ',
    'any.required': 'ID sản phẩm là bắt buộc',
  }),
  content: Joi.string().trim().min(1).max(2000).required().messages({
    'string.empty': 'Nội dung phản hồi không được để trống',
    'string.max': 'Nội dung phản hồi tối đa 2000 ký tự',
  }),
  id_parent_comment: Joi.string().uuid().required().messages({
    'string.guid': 'ID bình luận gốc không hợp lệ',
    'any.required': 'ID bình luận gốc là bắt buộc',
  }),
  reply_to_user: Joi.string().allow(null, '').max(100),
});
